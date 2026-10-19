const TOPICS = ["Cell Biology", "Contract Law", "Macroeconomics", "Organic Chemistry", "World War II", "Data Structures", "Pharmacology"];

export function TopicMarquee() {
  // The list is rendered twice so the -50% translate loops seamlessly.
  const items = [...TOPICS, ...TOPICS];
  return (
    <section aria-label="Example topics" className="overflow-hidden bg-brand py-[22px] text-white">
      <div className="st-marquee flex w-max gap-12 whitespace-nowrap font-display text-[26px] font-bold">
        {items.map((topic, i) => (
          <span key={i} className="flex items-center gap-12" aria-hidden={i >= TOPICS.length}>
            {topic}
            <span className="text-lime">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}
