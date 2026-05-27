import type { Metadata } from "next";
import { Red_Hat_Text, Lexend_Deca } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ClientScrollProgress from "@/components/ClientScrollProgress";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, AUTHOR_NAME, AUTHOR_BIO, AUTHOR_TITLE } from "@/lib/constants";


const redHatText = Red_Hat_Text({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Practical Notes on AI and Growth`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  keywords: [
    "enterprise AI",
    "digital transformation",
    "commercial growth",
    "APAC",
    "Nathan Petralia",
    "AI strategy",
    "GTM",
    "program delivery",
    "AI deployment",
    "Hong Kong",
  ],
  authors: [{ name: AUTHOR_NAME, url: `${SITE_URL}/about` }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_TAGLINE,
        publisher: { "@id": `${SITE_URL}/#person` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/posts?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: AUTHOR_NAME,
        url: SITE_URL,
        description: AUTHOR_BIO,
        jobTitle: AUTHOR_TITLE,
        sameAs: [
          "https://www.linkedin.com/in/petralian/",
          "https://github.com/petralian/",
        ],
        knowsAbout: [
          "Enterprise AI",
          "Digital Transformation",
          "Commercial Growth",
          "APAC Markets",
          "GTM Strategy",
          "Program Delivery",
          "Generative AI",
        ],
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${redHatText.variable} ${lexendDeca.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      {/* Anti-FOUC: apply stored theme before first paint */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)petralian-theme=([^;]+)/);var t=m?m[1]:null;if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="footer-inner">
            <p>© {new Date().getFullYear()} {SITE_NAME} - Built and written by Nathan Petralia & AI - All rights reserved</p>
          </div>
        </footer>
        <ClientScrollProgress />
      </body>
    </html>
  );
}

