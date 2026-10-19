import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Footer } from "@/components/marketing/Footer";
import { FreeBand } from "@/components/marketing/FreeBand";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Showcase } from "@/components/marketing/Showcase";
import { StudyModes } from "@/components/marketing/StudyModes";
import { TopicMarquee } from "@/components/marketing/TopicMarquee";

export default function HomePage() {
  return (
    <div id="top" className="overflow-x-clip">
      <Hero />
      <TopicMarquee />
      <main>
        <HowItWorks />
        <StudyModes />
        <Showcase />
        <FreeBand />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
