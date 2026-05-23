"use client";
import dynamic from "next/dynamic";

const ScrollProgress = dynamic(() => import("@/components/ScrollProgress"), { ssr: false });

export default function ClientScrollProgress() {
  return <ScrollProgress />;
}
