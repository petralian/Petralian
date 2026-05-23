import crypto from "crypto";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

function validEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sign(email: string): string {
    const secret = process.env.UNSUBSCRIBE_SECRET || "";
    if (!secret) throw new Error("UNSUBSCRIBE_SECRET is missing");
    return crypto.createHmac("sha256", secret).update(email.toLowerCase()).digest("hex");
}

function htmlPage(message: string): Response {
    const html = `<!doctype html>
  <html><body style="font-family:Arial,Helvetica,sans-serif;background:#f6f7fb;padding:40px;">
  <div style="max-width:680px;margin:0 auto;background:#fff;padding:28px;border-radius:12px;">
    <h1 style="margin:0 0 12px;color:#111827;font-size:24px;">${SITE_NAME}</h1>
    <p style="margin:0;color:#374151;font-size:16px;line-height:1.7;">${message}</p>
    <p style="margin:16px 0 0;"><a href="${SITE_URL}" style="color:#111827;">Return to site</a></p>
  </div></body></html>`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const email = (url.searchParams.get("email") || "").trim().toLowerCase();
    const token = (url.searchParams.get("token") || "").trim();

    if (!email || !token || !validEmail(email)) {
        return htmlPage("This unsubscribe link is incomplete. Please use the link from your email.");
    }

    let expected = "";
    try {
        expected = sign(email);
    } catch {
        return htmlPage("Unsubscribe is not configured yet. Please contact support.");
    }

    if (token !== expected) {
        return htmlPage("This unsubscribe link is invalid or has expired.");
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        return htmlPage("Unsubscribe service is not configured yet. Please try again later.");
    }

    const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            emailBlacklisted: true,
            smsBlacklisted: true,
        }),
        cache: "no-store",
    });

    if (!res.ok) {
        return htmlPage("We could not process your unsubscribe right now. Please try again later.");
    }

    return htmlPage("You have been unsubscribed. You will not receive future digest emails.");
}
