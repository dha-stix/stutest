/* Small animated SVGs used across the app. Animation classes live in styles/animations.css. */

export const sparklePath = (x: number, y: number, s: number) =>
  `M${x} ${y} l${s} ${2.5 * s} ${2.5 * s} ${s} -${2.5 * s} ${s} -${s} ${2.5 * s} -${s} -${2.5 * s} -${2.5 * s} -${s} ${2.5 * s} -${s}z`;

export function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={`sv-flame ${className ?? ""}`} width="40" height="52" viewBox="0 0 44 56" aria-hidden="true">
      <path d="M22 2 C30 16 40 22 40 36 A18 18 0 0 1 4 36 C4 26 12 22 14 12 C18 18 20 20 22 22 C24 14 22 8 22 2Z" fill="var(--color-coral)" />
      <path d="M22 28 C27 34 30 38 30 43 A8 8 0 0 1 14 43 C14 38 18 34 22 28Z" fill="#FFD166" />
    </svg>
  );
}

/** Circular progress ring that animates up to `value` (0–1). */
export function ProgressRing({ value, size = 84, label, track = "var(--color-ink-line)", color = "var(--color-lime)", textColor = "var(--color-paper)" }: {
  value: number;
  size?: number;
  label: string;
  track?: string;
  color?: string;
  textColor?: string;
}) {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(1, Math.max(0, value)));
  return (
    <svg width={size} height={size} viewBox="0 0 84 84" role="img" aria-label={label}>
      <circle cx="42" cy="42" r={r} fill="none" stroke={track} strokeWidth="8" />
      <circle
        className="sv-ring"
        cx="42"
        cy="42"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 42 42)"
        style={{ ["--ring-from" as string]: circumference }}
      />
      <text x="42" y="47" textAnchor="middle" fontWeight="700" fontSize="15" fill={textColor}>
        {Math.round(value * 100)}%
      </text>
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <rect width="64" height="64" rx="18" fill="var(--color-ink)" />
      <path d="M22 28 V22 a10 10 0 0 1 20 0 v6" fill="none" stroke="var(--color-lime)" strokeWidth="4" strokeLinecap="round" />
      <rect x="16" y="28" width="32" height="24" rx="6" fill="var(--color-brand)" />
      <g className="sv-turn">
        <circle cx="32" cy="38" r="4" fill="var(--color-lime)" />
        <rect x="30.5" y="38" width="3" height="8" rx="1.5" fill="var(--color-lime)" />
      </g>
    </svg>
  );
}

export function CheckBadge({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <circle cx="20" cy="20" r="20" fill="var(--color-success)" />
      <path className="sv-draw-once" d="M12 20l6 6 11-12" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Sparkles() {
  return (
    <svg width="44" height="36" viewBox="0 0 44 36" aria-hidden="true">
      <path className="sv-twinkle" d={sparklePath(14, 4, 4)} fill="var(--color-lime)" />
      <path className="sv-twinkle" style={{ animationDelay: "0.8s" }} d={sparklePath(36, 2, 2)} fill="var(--color-brand-line)" />
    </svg>
  );
}

const CONFETTI = [
  { x: 120, y: 220, w: 12, h: 6, c: "var(--color-lime)", d: 0 },
  { x: 260, y: 120, r: 5, c: "#8576F7", d: 0.4 },
  { x: 420, y: 80, w: 10, h: 10, c: "var(--color-coral)", d: 0.9 },
  { x: 610, y: 60, r: 6, c: "#7EE2B4", d: 1.3 },
  { x: 760, y: 110, w: 14, h: 6, c: "var(--color-lime)", d: 0.2 },
  { x: 900, y: 200, r: 5, c: "var(--color-coral)", d: 1.7 },
  { x: 1040, y: 70, w: 10, h: 10, c: "#8576F7", d: 0.6 },
  { x: 1120, y: 260, r: 6, c: "var(--color-lime)", d: 2 },
  { x: 60, y: 60, w: 8, h: 14, c: "#7EE2B4", d: 1.1 },
];

export function ConfettiBurst() {
  return (
    <svg viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
      {CONFETTI.map((p, i) =>
        p.r ? (
          <circle key={i} className="sv-pop" style={{ animationDelay: `${p.d}s` }} cx={p.x} cy={p.y} r={p.r} fill={p.c} />
        ) : (
          <rect key={i} className="sv-pop" style={{ animationDelay: `${p.d}s` }} x={p.x} y={p.y} width={p.w} height={p.h} rx="2" fill={p.c} />
        ),
      )}
      <path className="sv-twinkle" d={sparklePath(340, 290, 4)} fill="var(--color-lime)" />
      <path className="sv-twinkle" style={{ animationDelay: "1s" }} d={sparklePath(980, 40, 3)} fill="var(--color-brand-line)" />
    </svg>
  );
}

export function PencilWrite() {
  return (
    <svg width="72" height="40" viewBox="0 0 72 40" aria-hidden="true" className="shrink-0">
      <line x1="4" y1="36" x2="68" y2="36" stroke="var(--color-brand)" strokeWidth="2" strokeDasharray="5 5" />
      <g className="sv-write">
        <path d="M10 30 L30 10 L36 16 L16 36 L8 38 Z" fill="var(--color-lime)" stroke="var(--color-ink)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M26 14 L32 20" stroke="var(--color-ink)" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function BulbIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true" className="shrink-0">
      <circle className="sv-glow" cx="28" cy="24" r="22" fill="var(--color-lime)" />
      <path d="M28 10 a12 12 0 0 1 7 21.7 V36 H21 V31.7 A12 12 0 0 1 28 10z" fill="#fff" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="22" y="38" width="12" height="4" rx="2" fill="var(--color-ink)" />
      <rect x="24" y="44" width="8" height="4" rx="2" fill="var(--color-ink)" />
      <path d="M25 24 l3 4 3 -4" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TapRipple() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="shrink-0">
      <circle className="sv-ripple" cx="14" cy="14" r="8" fill="none" stroke="var(--color-lime)" strokeWidth="2" />
      <circle cx="14" cy="14" r="4" fill="var(--color-lime)" />
    </svg>
  );
}

/** Clock icon whose hand sweeps around; used in the quiz timer. */
export function TimerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="13" r="8" />
      <path d="M9 2h6" />
      <path className="sv-hand" d="M12 13V8" />
    </svg>
  );
}
