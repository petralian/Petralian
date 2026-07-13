import Script from "next/script";
import {
  TRUCONVERSION_REVEAL_CLIENT_ID,
  TRUCONVERSION_REVEAL_ENABLED,
  TRUCONVERSION_SCRIPT_PATH,
} from "@/lib/constants";

/**
 * TruConversion heatmaps (ti-js). Reveal visitor tracking is opt-in — it 402s
 * when quota is exceeded and breaks Lighthouse console / bfcache audits.
 */
export default function TruConversion() {
  if (
    process.env.NODE_ENV !== "production" ||
    !TRUCONVERSION_SCRIPT_PATH
  ) {
    return null;
  }

  return (
    <>
      <Script id="truconversion" strategy="lazyOnload">
        {`
          var _tip = _tip || [];
          (function(d,s,id){
            var js, tjs = d.getElementsByTagName(s)[0];
            if(d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.async = true;
            js.src = d.location.protocol + '//app.truconversion.com/ti-js/${TRUCONVERSION_SCRIPT_PATH}.js';
            tjs.parentNode.insertBefore(js, tjs);
          }(document, 'script', 'ti-js'));
        `}
      </Script>
      {TRUCONVERSION_REVEAL_ENABLED && TRUCONVERSION_REVEAL_CLIENT_ID ? (
        <Script id="truconversion-reveal" strategy="lazyOnload">
          {`
            !function(){
              var e="rest.revealid.xyz/v3/script?clientId=${TRUCONVERSION_REVEAL_CLIENT_ID}&version=4.0.0",
              t=document.createElement("script");
              t.src="https://"+e;
              var c=document.getElementsByTagName("script")[0];
              t.async = true;
              t.onload = function(){ new Reveal.default };
              c.parentNode.insertBefore(t,c);
            }();
          `}
        </Script>
      ) : null}
    </>
  );
}
