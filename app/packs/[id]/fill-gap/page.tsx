"use client";

import { StudyShell } from "@/components/app/StudyShell";
import { FillGap } from "@/components/study/FillGap";

export default function FillGapPage() {
  return <StudyShell>{(pack) => <FillGap pack={pack} />}</StudyShell>;
}
