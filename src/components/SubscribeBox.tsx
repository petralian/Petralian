"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function SubscribeBox() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (res.ok) {
        setState("success");
      } else {
        setErrorMessage(
          data?.message ||
          "Subscription failed. Please try again in a minute, or email nathan@petralian.com."
        );
        setState("error");
      }
    } catch {
      setErrorMessage(
        "Subscription failed. Please try again in a minute, or email nathan@petralian.com."
      );
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="subscribe-box">
        <p className="subscribe-confirm">
          Please confirm your email to finish subscribing. After confirmation, you will receive the weekly digest.
        </p>
      </div>
    );
  }

  return (
    <div className="subscribe-box">
      <p className="subscribe-headline">
        Get practical posts on enterprise AI and transformation. Only useful updates, sent as a weekly digest.
      </p>
      <form onSubmit={handleSubmit} className="subscribe-form" noValidate>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px" }}
        />
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
        <p className="subscribe-error">{errorMessage}</p>
      )}
      <p className="subscribe-note">One practical digest each week. Unsubscribe anytime.</p>
    </div>
  );
}
