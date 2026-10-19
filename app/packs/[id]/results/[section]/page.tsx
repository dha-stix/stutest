"use client";

import { StudyShell } from "@/components/app/StudyShell";
import { Results } from "@/components/study/Results";

export default function ResultsPage() {
  return <StudyShell>{(pack) => <Results pack={pack} />}</StudyShell>;
}
