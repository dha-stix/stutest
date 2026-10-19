"use client";

import { StudyShell } from "@/components/app/StudyShell";
import { Flashcards } from "@/components/study/Flashcards";

export default function FlashcardsPage() {
  return <StudyShell>{(pack) => <Flashcards pack={pack} />}</StudyShell>;
}
