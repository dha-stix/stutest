import { ButtonLink } from "../ui/Button";
import { Reveal } from "./Reveal";
import { sectionX } from "./SectionHeading";

export function FinalCta() {
  return (
    <section className={`pt-28 ${sectionX}`}>
      <Reveal className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-8 rounded-[32px] bg-lime p-[clamp(32px,6vw,80px)]">
        <h2 className="max-w-[640px] font-display text-[clamp(32px,4.6vw,60px)] font-extrabold leading-none tracking-[-0.03em]">
          Your next exam starts with one topic.
        </h2>
        <ButtonLink href="/auth/register" size="lg">
          Create my first test →
        </ButtonLink>
      </Reveal>
    </section>
  );
}
