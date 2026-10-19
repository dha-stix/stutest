"use client";

import { Suspense } from "react";
import { StudyShell } from "@/components/app/StudyShell";
import { Quiz } from "@/components/study/Quiz";

export default function QuizPage() {
  return (
    <Suspense>
      <StudyShell>{(pack) => <Quiz pack={pack} />}</StudyShell>
    </Suspense>
  );
}
