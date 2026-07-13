import Script from "next/script";
import { TRUCONVERSION_SITE_ID } from "@/lib/constants";

/**
 * TruConversion heatmaps / session replay. Production only — set NEXT_PUBLIC_TRUCONVERSION_SITE_ID.
 */
export default function TruConversion() {
  if (process.env.NODE_ENV !== "production" || !TRUCONVERSION_SITE_ID) {
    return null;
  }

  return (
    <Script id="truconversion" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'tc.start':new Date().getTime(),event:'tc.js'});
        var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;
        j.src='https://cdn.truconversion.com/tc.js?id='+i;
        f.parentNode.insertBefore(j,f);
        })(window,document,'script','_tcq','${TRUCONVERSION_SITE_ID}');
      `}
    </Script>
  );
}
