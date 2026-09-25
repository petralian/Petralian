import type { Metadata } from "next";
import { ENZO_SITE_URL } from "@/lib/enzo-site";
import "./enzo-site.css";

export const metadata: Metadata = {
  metadataBase: new URL(ENZO_SITE_URL),
  title: "Most Handsome Man in Hong Kong — Official* Registry",
  description:
    "A totally serious glamour board celebrating Enzo, self-certified Hong Kong superlative per Grade 4 humanities homework.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Most Handsome Man in Hong Kong",
    description: "Enzo!!! 😎 — evidence on file.",
    url: ENZO_SITE_URL,
    type: "website",
  },
};

export default function EnzoLayout({ children }: { children: React.ReactNode }) {
  return <div className="enzo-site">{children}</div>;
}
