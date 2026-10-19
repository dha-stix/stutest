"use client";

import { motion } from "motion/react";
import { sparklePath } from "../svg/AnimatedIcons";

export function GeneratingOverlay({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div role="dialog" aria-modal="true" aria-label="Generating your pack" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-[28px] bg-white p-8 text-center"
      >
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true" className="mx-auto">
          <circle cx="60" cy="60" r="44" fill="none" stroke="var(--color-brand-soft)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="44"
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - pct / 100)}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset .6s ease" }}
          />
          <g className="sv-orbit" style={{ transformOrigin: "60px 60px", animationDuration: "6s" }}>
            <circle cx="60" cy="6" r="6" fill="var(--color-lime)" />
          </g>
          <path className="sv-twinkle" d={sparklePath(56, 46, 4)} fill="var(--color-lime)" />
          <text x="60" y="78" textAnchor="middle" fontWeight="800" fontSize="16" fill="var(--color-ink)">
            {pct}%
          </text>
        </svg>
        <h2 className="mt-4 font-display text-2xl font-bold">Building your pack</h2>
        <p className="mt-2 text-muted" aria-live="polite">
          {label}
        </p>
        <p className="mt-4 text-[13px] text-faint">Large question sets can take a minute or two. Keep this tab open.</p>
      </motion.div>
    </div>
  );
}
