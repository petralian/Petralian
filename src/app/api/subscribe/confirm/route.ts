import crypto from "crypto";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const CONFIRM_WINDOW_MS = 24 * 60 * 60 * 1000;

function validEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSubscribeSecret(): string {
    return process.env.SUBSCRIBE_CONFIRM_SECRET || process.env.UNSUBSCRIBE_SECRET || "";
}

function signSubscribeToken(email: string, name: string, ts: number): string {
    const secret = getSubscribeSecret();
    if (!secret) throw new Error("SUBSCRIBE_CONFIRM_SECRET is missing");
    return crypto
        .createHmac("sha256", secret)
        .update(`${email.toLowerCase()}|${name}|${ts}`)
        .digest("hex");
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

async function subscribeWithBrevo(name: string, email: string): Promise<void> {
    const apiKey = process.env.BREVO_API_KEY;
    const rawListId = process.env.BREVO_LIST_ID;

    if (!apiKey) {
        throw new Error("Brevo is not configured");
    }

    const listId = rawListId ? Number(rawListId) : undefined;
    const payload: {
        email: string;
        attributes?: { FIRSTNAME?: string };
        listIds?: number[];
        updateEnabled: boolean;
        emailBlacklisted: boolean;
    } = {
        email,
        updateEnabled: true,
        emailBlacklisted: false,
    };

    if (name) payload.attributes = { FIRSTNAME: name };
    if (Number.isFinite(listId)) payload.listIds = [listId as number];

    const response = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Brevo subscribe failed: ${response.status}`);
    }
}

export async function GET(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const email = (url.searchParams.get("email") || "").trim().toLowerCase();
    const name = (url.searchParams.get("name") || "").trim();
    const tsRaw = (url.searchParams.get("ts") || "").trim();
    const token = (url.searchParams.get("token") || "").trim();

    if (!email || !token || !tsRaw || !validEmail(email)) {
        return htmlPage("This confirmation link is incomplete. Please use the link from your email.");
    }

    const ts = Number(tsRaw);
    if (!Number.isFinite(ts)) {
        return htmlPage("This confirmation link is invalid.");
    }

    if (Date.now() - ts > CONFIRM_WINDOW_MS) {
        return htmlPage("This confirmation link has expired. Please subscribe again.");
    }

    let expected = "";
    try {
        expected = signSubscribeToken(email, name, ts);
    } catch {
        return htmlPage("Subscription confirmation is not configured yet. Please contact support.");
    }

    if (token !== expected) {
        return htmlPage("This confirmation link is invalid or has expired.");
    }

    try {
        await subscribeWithBrevo(name, email);
        return htmlPage("Subscription confirmed. You will receive the weekly digest.");
    } catch {
        return htmlPage("We could not confirm your subscription right now. Please try again later.");
    }
}
