import { Logo } from "../ui/Logo";

const sparkle = (x: number, y: number, s: number) =>
  `M${x} ${y} l${s} ${2.5 * s} ${2.5 * s} ${s} -${2.5 * s} ${s} -${s} ${2.5 * s} -${s} -${2.5 * s} -${2.5 * s} -${s} ${2.5 * s} -${s}z`;

/** Dark panel with floating Q/A cards for the login page. */
export function LoginAside() {
  return (
    <div className="relative flex h-full min-h-[420px] flex-col justify-between gap-10 overflow-hidden bg-ink p-[clamp(24px,4vw,56px)] text-paper">
      <Logo />
      <div className="relative h-[280px]" aria-hidden="true">
        <svg viewBox="0 0 500 280" className="absolute inset-0 size-full">
          <g className="sv-orbit" style={{ transformOrigin: "250px 140px" }}>
            <ellipse cx="250" cy="140" rx="220" ry="120" fill="none" stroke="var(--color-ink-line)" strokeWidth="2" strokeDasharray="4 10" />
            <circle cx="470" cy="140" r="7" fill="var(--color-lime)" />
            <circle cx="30" cy="140" r="5" fill="#8576F7" />
          </g>
          <path className="sv-twinkle" d={sparkle(440, 30, 4)} fill="var(--color-lime)" />
          <path className="sv-twinkle" style={{ animationDelay: "1s" }} d={sparkle(60, 220, 3)} fill="var(--color-brand-line)" />
        </svg>
        <div className="st-float-a absolute left-[8%] top-2.5 flex h-[180px] w-[280px] max-w-[70%] flex-col justify-between rounded-3xl bg-brand p-6">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#e7e3ff]">Question</span>
          <span className="font-display text-2xl font-bold leading-tight">What is the law of supply?</span>
        </div>
        <div className="st-float-b absolute right-[8%] top-[90px] flex h-[170px] w-[260px] max-w-[65%] flex-col justify-between rounded-3xl bg-lime p-6 text-ink">
          <span className="text-xs font-bold uppercase tracking-[0.08em]">Answer</span>
          <span className="font-semibold leading-snug">As price rises, the quantity supplied rises too.</span>
        </div>
      </div>
      <div>
        <h2 className="mb-3 font-display text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.05] tracking-[-0.03em]">Pick up where you left off.</h2>
        <p className="max-w-[420px] leading-relaxed text-soft">Your packs, scores and chats are waiting.</p>
      </div>
    </div>
  );
}

const STEPS = [
  { title: "Add your AI key", sub: "Claude, ChatGPT or Grok — verified instantly", dark: true },
  { title: "Enter a topic or upload", sub: "PDF or DOCX, up to 20 pages" },
  { title: "Get tested", sub: "MCQ, flashcards, fill-in-the-gap, key points, chat" },
];

/** Lime panel previewing onboarding for the register page. */
export function RegisterAside() {
  return (
    <div className="flex h-full flex-col justify-center gap-5 bg-lime p-[clamp(24px,4vw,64px)]">
      <svg viewBox="0 0 400 90" className="h-[90px] w-full" role="img" aria-label="Three steps from sign-up to test">
        <path className="sv-march" d="M30 62 C110 0 200 110 280 40 S360 30 370 30" fill="none" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
        {[
          { x: 30, y: 62, dark: true },
          { x: 190, y: 56 },
          { x: 280, y: 40 },
        ].map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="14" fill={n.dark ? "var(--color-ink)" : "#fff"} />
            <text x={n.x} y={n.y + 5} textAnchor="middle" fontWeight="700" fontSize="13" fill={n.dark ? "var(--color-lime)" : "var(--color-brand)"}>
              {i + 1}
            </text>
          </g>
        ))}
        <path className="sv-twinkle" d={sparkle(372, 14, 5)} fill="var(--color-brand)" />
      </svg>
      <p className="text-sm font-bold uppercase tracking-[0.1em]">After you sign up</p>
      {STEPS.map((s, i) => (
        <div
          key={s.title}
          className={`st-in flex items-center gap-[18px] rounded-[22px] p-6 ${s.dark ? "bg-ink text-paper" : "bg-white"}`}
          style={{ animationDelay: `${i * 0.12}s` }}
        >
          <span className={`font-mono text-lg font-bold ${s.dark ? "text-lime" : "text-brand"}`}>0{i + 1}</span>
          <div>
            <div className="text-lg font-bold">{s.title}</div>
            <div className={`mt-1 text-[15px] ${s.dark ? "text-soft" : "text-muted"}`}>{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
