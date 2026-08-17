"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Mount GA and Clarity after first interaction (keeps Lighthouse clean).
 */
export default function DeferredProductionScripts({
  children,
}: {
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const activate = () => setReady(true);
    const opts: AddEventListenerOptions = { once: true, passive: true };

    window.addEventListener("pointerdown", activate, opts);
    window.addEventListener("keydown", activate, opts);
    window.addEventListener("touchstart", activate, opts);

    return () => {
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
      window.removeEventListener("touchstart", activate);
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
