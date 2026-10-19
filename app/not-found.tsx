import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-ink px-4 text-center text-paper">
      <Logo />
      <p className="font-display text-[clamp(72px,14vw,160px)] font-extrabold leading-none text-lime">404</p>
      <h1 className="font-display text-3xl font-bold">This page skipped class.</h1>
      <p className="max-w-md text-soft">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <ButtonLink href="/" variant="lime">
        Back to home
      </ButtonLink>
    </main>
  );
}
