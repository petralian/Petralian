"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function SubscribeBox() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setState("submitting");

    const endpoint = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT;
    if (!endpoint) {
      // No endpoint configured — open a mailto as fallback
      window.location.href = `mailto:nathan@petralian.com?subject=Subscribe&body=Name: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}`;
      setState("success");
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (res.ok) {
        setState("success");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="subscribe-box">
        <p className="subscribe-confirm">
          You&apos;re in. New posts will land in your inbox when they&apos;re worth reading.
        </p>
      </div>
    );
  }

  return (
    <div className="subscribe-box">
      <p className="subscribe-headline">
        I write about enterprise AI and transformation from inside the work, not from the sidelines.
        New posts in your inbox when they&apos;re worth saying.
      </p>
      <form onSubmit={handleSubmit} className="subscribe-form" noValidate>
        <input
          type="text"
          placeholder="First name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="subscribe-input"
          autoComplete="given-name"
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="subscribe-input"
          required
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={state === "submitting" || !email.trim()}
          className="subscribe-btn"
        >
          {state === "submitting" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {state === "error" && (
        <p className="subscribe-error">Something went wrong. Try emailing me directly: nathan@petralian.com</p>
      )}
      <p className="subscribe-note">No cadence. No fluff. Just new posts.</p>
    </div>
  );
}
