import type { Metadata } from "next";
import { Red_Hat_Text, Lexend_Deca } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ScrollProgress from "@/components/ScrollProgress";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";

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
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
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
  return (
    <html
      lang="en"
      className={`${redHatText.variable} ${lexendDeca.variable}`}
      suppressHydrationWarning
    >
      {/* Anti-FOUC: apply stored theme before first paint */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)petralian-theme=([^;]+)/);var t=m?m[1]:null;if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="footer-inner">
            <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          </div>
        </footer>
        <ScrollProgress />
      </body>
    </html>
  );
}

