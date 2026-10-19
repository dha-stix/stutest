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
} from "firebase/firestore";
import { firebaseAuth, firestore, googleProvider, isFirebaseConfigured } from "./firebase";
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
 *
 * Without Firebase config the same operations run against localStorage
 * ("demo mode") so the app can be tried before it is wired up.
 */

type Unsubscribe = () => void;
type WithId<T> = T & { id: string };

interface Backend {
  onAuthChange(cb: (user: AppUser | null) => void): Unsubscribe;
  signIn(): Promise<AppUser>;
  signOut(): Promise<void>;
  get<T>(path: string): Promise<T | null>;
  set(path: string, data: object): Promise<void>;
  remove(path: string): Promise<void>;
  add(collectionPath: string, data: object): Promise<string>;
  list<T>(collectionPath: string, field?: string, equals?: string): Promise<WithId<T>[]>;
}

/** Firestore rejects `undefined`; a JSON round-trip drops those fields. */
const clean = <T extends object>(data: T): T => JSON.parse(JSON.stringify(data));

const toAppUser = (u: User): AppUser => ({
  uid: u.uid,
  name: u.displayName ?? "Student",
  email: u.email ?? "",
  photoURL: u.photoURL,
});

const firestoreBackend: Backend = {
  onAuthChange: (cb) => onAuthStateChanged(firebaseAuth(), (u) => cb(u ? toAppUser(u) : null)),
  async signIn() {
    const { user } = await signInWithPopup(firebaseAuth(), googleProvider());
    const appUser = toAppUser(user);
    await setDoc(doc(firestore(), "users", user.uid), clean({ ...appUser, lastLoginAt: Date.now() }), { merge: true });
    return appUser;
  },
  signOut: () => signOut(firebaseAuth()),
  async get<T>(path: string) {
    const snap = await getDoc(doc(firestore(), path));
    return snap.exists() ? ({ ...snap.data(), id: snap.id } as T) : null;
  },
  async set(path, data) {
    await setDoc(doc(firestore(), path), clean(data));
  },
  async remove(path) {
    await deleteDoc(doc(firestore(), path));
  },
  async add(collectionPath, data) {
    const ref = await addDoc(collection(firestore(), collectionPath), clean(data));
    return ref.id;
  },
  async list<T>(collectionPath: string, field?: string, equals?: string) {
    const col = collection(firestore(), collectionPath);
    const snap = await getDocs(field ? query(col, where(field, "==", equals)) : col);
    return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
  },
};

/* ---------- demo mode (localStorage) ---------- */

const DEMO_USER_KEY = "stutest:demo-user";
const DEMO_DB_KEY = "stutest:demo-db";
const demoListeners = new Set<(user: AppUser | null) => void>();

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: demo data simply won't persist.
  }
}

const demoDb = () => readStore<Record<string, object>>(DEMO_DB_KEY, {});
const newId = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);

const demoBackend: Backend = {
  onAuthChange(cb) {
    demoListeners.add(cb);
    cb(readStore<AppUser | null>(DEMO_USER_KEY, null));
    return () => demoListeners.delete(cb);
  },
  async signIn() {
    const user: AppUser = { uid: "demo-user", name: "Demo Student", email: "demo@stutest.app", photoURL: null };
    writeStore(DEMO_USER_KEY, user);
    demoListeners.forEach((l) => l(user));
    return user;
  },
  async signOut() {
    localStorage.removeItem(DEMO_USER_KEY);
    demoListeners.forEach((l) => l(null));
  },
  async get<T>(path: string) {
    const data = demoDb()[path];
    return data ? ({ ...data, id: path.split("/").pop() } as T) : null;
  },
  async set(path, data) {
    writeStore(DEMO_DB_KEY, { ...demoDb(), [path]: clean(data) });
  },
  async remove(path) {
    const db = demoDb();
    for (const key of Object.keys(db)) if (key === path || key.startsWith(path + "/")) delete db[key];
    writeStore(DEMO_DB_KEY, db);
  },
  async add(collectionPath, data) {
    const id = newId();
    await this.set(`${collectionPath}/${id}`, data);
    return id;
  },
  async list<T>(collectionPath: string, field?: string, equals?: string) {
    const depth = collectionPath.split("/").length + 1;
    return Object.entries(demoDb())
      .filter(([key]) => key.startsWith(collectionPath + "/") && key.split("/").length === depth)
      .map(([key, value]) => ({ ...(value as T), id: key.split("/").pop()! }))
      .filter((item) => !field || (item as Record<string, unknown>)[field] === equals);
  },
};

const backend = (): Backend => (isFirebaseConfigured ? firestoreBackend : demoBackend);
export const isDemoMode = !isFirebaseConfigured;

/* ---------- auth ---------- */

export const onAuthChange = (cb: (user: AppUser | null) => void) => backend().onAuthChange(cb);
export const signInWithGoogle = () => backend().signIn();
export const signOutUser = () => backend().signOut();

/* ---------- AI settings ---------- */

const settingsPath = (uid: string) => `users/${uid}/private/settings`;

export const getUserSettings = (uid: string) => backend().get<UserSettings>(settingsPath(uid));

export function saveUserSettings(uid: string, settings: Omit<UserSettings, "keyLast4" | "verifiedAt">) {
  const full: UserSettings = { ...settings, keyLast4: settings.apiKey.slice(-4), verifiedAt: Date.now() };
  return backend().set(settingsPath(uid), full).then(() => full);
}

export const removeUserSettings = (uid: string) => backend().remove(settingsPath(uid));

/* ---------- packs ---------- */

export async function createPack(uid: string, pack: NewPack): Promise<string> {
  return backend().add("packs", { ...pack, uid, createdAt: Date.now() });
}

export async function getPack(packId: string, uid: string): Promise<Pack | null> {
  const pack = await backend().get<Pack>(`packs/${packId}`);
  return pack && pack.uid === uid ? pack : null;
}

export async function listPacks(uid: string): Promise<Pack[]> {
  const packs = await backend().list<Pack>("packs", "uid", uid);
  return packs.sort((a, b) => b.createdAt - a.createdAt);
}

/** Deletes a pack with its attempts and chat (Firestore doesn't cascade subcollections). */
export async function deletePack(packId: string, uid: string) {
  const attempts = await backend().list<Attempt>(`packs/${packId}/attempts`, "uid", uid);
  await Promise.all(attempts.map((a) => backend().remove(`packs/${packId}/attempts/${a.id}`)));
  await backend().remove(`packs/${packId}/chats/main`);
  await backend().remove(`packs/${packId}`);
}

/* ---------- attempts ---------- */

export async function saveAttempt(uid: string, attempt: NewAttempt): Promise<Attempt> {
  const full = { ...attempt, uid, createdAt: Date.now() };
  const id = await backend().add(`packs/${attempt.packId}/attempts`, full);
  return { ...full, id };
}

export async function listAttempts(packId: string, uid: string): Promise<Attempt[]> {
  const attempts = await backend().list<Attempt>(`packs/${packId}/attempts`, "uid", uid);
  return attempts.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getLatestAttempt(packId: string, uid: string, mode: ScoredMode, section: number) {
  const attempts = await listAttempts(packId, uid);
  return attempts.find((a) => a.mode === mode && a.section === section) ?? null;
}

/* ---------- chat ---------- */

const chatPath = (packId: string) => `packs/${packId}/chats/main`;

export async function getChat(packId: string): Promise<ChatMessage[]> {
  const chat = await backend().get<{ messages: ChatMessage[] }>(chatPath(packId));
  return chat?.messages ?? [];
}

export const saveChat = (packId: string, uid: string, messages: ChatMessage[]) =>
  backend().set(chatPath(packId), { uid, messages, updatedAt: Date.now() });

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
