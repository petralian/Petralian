"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GA4 custom event on 404 — captures attempted path and referrer for Explorations.
 * Standard page_title still shows "404 - Page Not Found - Petralian".
 */
export default function NotFoundAnalytics() {
  useEffect(() => {
    if (typeof window.gtag !== "function") return;

    const path = window.location.pathname;
    const referrer = document.referrer || "(direct)";
    let referrerHost = "(direct)";
    try {
      if (document.referrer) referrerHost = new URL(document.referrer).hostname;
    } catch {
      referrerHost = "(invalid)";
    }

    window.gtag("event", "page_not_found", {
      attempted_path: path,
      attempted_url: window.location.href,
      page_referrer: referrer,
      referrer_host: referrerHost,
      query_string: window.location.search || "(none)",
    });
  }, []);

  return null;
}
