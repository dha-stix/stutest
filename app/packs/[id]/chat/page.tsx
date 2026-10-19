"use client";

import { StudyShell } from "@/components/app/StudyShell";
import { Chat } from "@/components/study/Chat";

export default function ChatPage() {
  return <StudyShell>{(pack) => <Chat pack={pack} />}</StudyShell>;
}
