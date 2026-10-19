"use client";

import { StudyShell } from "@/components/app/StudyShell";
import { Keypoints } from "@/components/study/Keypoints";

export default function KeypointsPage() {
  return <StudyShell>{(pack) => <Keypoints pack={pack} />}</StudyShell>;
}
