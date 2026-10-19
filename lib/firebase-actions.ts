"use client";

import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { firebaseAuth, firestore, googleProvider } from "./firebase";
import type { AppUser, Attempt, ChatMessage, NewAttempt, NewPack, Pack, ScoredMode, UserSettings } from "./types";

/*
 * Every read and write the app makes goes through this file.
 *
 * Firestore layout (see firestore.rules):
 *   users/{uid}                     public profile
 *   users/{uid}/private/settings    AI provider + API key (owner only)
 *   packs/{packId}                  generated pack, has `uid`
 *   packs/{packId}/attempts/{id}    scored attempts
 *   packs/{packId}/chats/main       chat history for the pack
 */

/** Firestore rejects `undefined`; a JSON round-trip drops those fields. */
const clean = <T extends object>(data: T): T => JSON.parse(JSON.stringify(data));

const toAppUser = (u: User): AppUser => ({
  uid: u.uid,
  name: u.displayName ?? "Student",
  email: u.email ?? "",
  photoURL: u.photoURL,
});

async function readDoc<T>(path: string): Promise<T | null> {
  const snap = await getDoc(doc(firestore(), path));
  return snap.exists() ? ({ ...snap.data(), id: snap.id } as T) : null;
}

async function listWhere<T>(collectionPath: string, field: string, equals: string): Promise<(T & { id: string })[]> {
  const snap = await getDocs(query(collection(firestore(), collectionPath), where(field, "==", equals)));
  return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
}

/* ---------- auth ---------- */

export const onAuthChange = (cb: (user: AppUser | null) => void) =>
  onAuthStateChanged(firebaseAuth(), (u) => cb(u ? toAppUser(u) : null));

export async function signInWithGoogle(): Promise<AppUser> {
  const { user } = await signInWithPopup(firebaseAuth(), googleProvider());
  const appUser = toAppUser(user);
  await setDoc(doc(firestore(), "users", user.uid), clean({ ...appUser, lastLoginAt: Date.now() }), { merge: true });
  return appUser;
}

export const signOutUser = () => signOut(firebaseAuth());

/* ---------- AI settings ---------- */

const settingsPath = (uid: string) => `users/${uid}/private/settings`;

export const getUserSettings = (uid: string) => readDoc<UserSettings>(settingsPath(uid));

export async function saveUserSettings(uid: string, settings: Omit<UserSettings, "keyLast4" | "verifiedAt">) {
  const full: UserSettings = { ...settings, keyLast4: settings.apiKey.slice(-4), verifiedAt: Date.now() };
  await setDoc(doc(firestore(), settingsPath(uid)), full);
  return full;
}

export const removeUserSettings = (uid: string) => deleteDoc(doc(firestore(), settingsPath(uid)));

/* ---------- packs ---------- */

export async function createPack(uid: string, pack: NewPack): Promise<string> {
  const ref = await addDoc(collection(firestore(), "packs"), clean({ ...pack, uid, createdAt: Date.now() }));
  return ref.id;
}

/** Returns null for missing packs and for packs owned by someone else (the rules deny those reads). */
export async function getPack(packId: string, uid: string): Promise<Pack | null> {
  try {
    const pack = await readDoc<Pack>(`packs/${packId}`);
    return pack && pack.uid === uid ? pack : null;
  } catch {
    return null;
  }
}

export async function listPacks(uid: string): Promise<Pack[]> {
  const packs = await listWhere<Pack>("packs", "uid", uid);
  return packs.sort((a, b) => b.createdAt - a.createdAt);
}

/** Deletes a pack with its attempts and chat (Firestore doesn't cascade subcollections). */
export async function deletePack(packId: string, uid: string) {
  const db = firestore();
  const attempts = await listWhere<Attempt>(`packs/${packId}/attempts`, "uid", uid);
  const batch = writeBatch(db);
  attempts.forEach((a) => batch.delete(doc(db, `packs/${packId}/attempts/${a.id}`)));
  batch.delete(doc(db, `packs/${packId}/chats/main`));
  batch.delete(doc(db, `packs/${packId}`));
  await batch.commit();
}

/* ---------- attempts ---------- */

export async function saveAttempt(uid: string, attempt: NewAttempt): Promise<Attempt> {
  const full = { ...attempt, uid, createdAt: Date.now() };
  const ref = await addDoc(collection(firestore(), `packs/${attempt.packId}/attempts`), clean(full));
  return { ...full, id: ref.id };
}

export async function listAttempts(packId: string, uid: string): Promise<Attempt[]> {
  const attempts = await listWhere<Attempt>(`packs/${packId}/attempts`, "uid", uid);
  return attempts.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getLatestAttempt(packId: string, uid: string, mode: ScoredMode, section: number) {
  const attempts = await listAttempts(packId, uid);
  return attempts.find((a) => a.mode === mode && a.section === section) ?? null;
}

/* ---------- chat ---------- */

const chatPath = (packId: string) => `packs/${packId}/chats/main`;

export async function getChat(packId: string): Promise<ChatMessage[]> {
  const chat = await readDoc<{ messages: ChatMessage[] }>(chatPath(packId));
  return chat?.messages ?? [];
}

export const saveChat = (packId: string, uid: string, messages: ChatMessage[]) =>
  setDoc(doc(firestore(), chatPath(packId)), clean({ uid, messages, updatedAt: Date.now() }));

/* ---------- dashboard stats ---------- */

export const listAttemptsForPacks = async (uid: string, packs: Pack[]) =>
  (await Promise.all(packs.map((p) => listAttempts(p.id, uid)))).flat();

export interface UserStats {
  packs: number;
  questionsAnswered: number;
  averageScore: number | null;
  streakDays: number;
}

export function computeStats(packs: Pack[], attempts: Attempt[]): UserStats {
  const answered = attempts.reduce((sum, a) => sum + a.total, 0);
  const scored = attempts.reduce((sum, a) => sum + a.score, 0);

  // Consecutive days (ending today or yesterday) with at least one attempt.
  const days = new Set(attempts.map((a) => new Date(a.createdAt).toDateString()));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    packs: packs.length,
    questionsAnswered: answered,
    averageScore: answered ? Math.round((scored / answered) * 100) : null,
    streakDays: streak,
  };
}
