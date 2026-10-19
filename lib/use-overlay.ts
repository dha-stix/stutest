"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Behaviour every mobile menu/drawer needs while open: page scroll locked, Escape
 * closes it, and it closes itself when the route changes or the screen grows past
 * the breakpoint where the menu is no longer used.
 */
export function useOverlay(open: boolean, close: () => void, desktopQuery = "(min-width: 768px)") {
  const pathname = usePathname();

  useEffect(() => {
    close();
    // Only react to navigation, not to `close` identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const media = window.matchMedia(desktopQuery);
    const onMedia = () => media.matches && close();
    window.addEventListener("keydown", onKey);
    media.addEventListener("change", onMedia);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      media.removeEventListener("change", onMedia);
    };
  }, [open, close, desktopQuery]);
}
