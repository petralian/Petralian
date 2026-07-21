"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ScrollProgress = dynamic(() => import("@/components/ScrollProgress"), { ssr: false });

export default function ClientScrollProgress() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(mount, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = globalThis.setTimeout(mount, 1500);
    return () => globalThis.clearTimeout(id);
  }, []);

  if (!ready) return null;
  return <ScrollProgress />;
}
