import crypto from "crypto";
import { NextResponse } from "next/server";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const ipBuckets = new Map<string, number[]>();

interface SubscribeBody {
    name?: string;
    email?: string;
    company?: string;
}

class ProviderError extends Error {
    provider: string;
    status: number;
    details: string;

    constructor(provider: string, status: number, details: string) {
        super(`${provider} subscribe failed: ${status}`);
        this.provider = provider;
        this.status = status;
        this.details = details;
    }
}

const CONFIRM_WINDOW_MS = 24 * 60 * 60 * 1000;

function toDetails(text: string): string {
    const value = text.trim();
    if (!value) return "No response body";
    return value.slice(0, 600);
}

function isDebugMode(): boolean {
    return process.env.NEWSLETTER_DEBUG === "1" || process.env.NODE_ENV !== "production";
}

function getSubscribeSecret(): string {
    return process.env.SUBSCRIBE_CONFIRM_SECRET || process.env.UNSUBSCRIBE_SECRET || "";
}

function signSubscribeToken(email: string, name: string, ts: number): string {
    const secret = getSubscribeSecret();
    if (!secret) throw new Error("SUBSCRIBE_CONFIRM_SECRET is not configured");
    return crypto
        .createHmac("sha256", secret)
        .update(`${email.toLowerCase()}|${name}|${ts}`)
        .digest("hex");
}

function buildConfirmUrl(email: string, name: string): string {
    const ts = Date.now();
    const token = signSubscribeToken(email, name, ts);
    const url = new URL(`${SITE_URL}/api/subscribe/confirm`);
    url.searchParams.set("email", email);
    if (name) url.searchParams.set("name", name);
    url.searchParams.set("ts", String(ts));
    url.searchParams.set("token", token);
    return url.toString();
}

async function sendBrevoConfirmationEmail(name: string, email: string): Promise<void> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@petralian.com";
    const senderName = process.env.BREVO_SENDER_NAME || SITE_NAME;

    if (!apiKey) {
        throw new Error("Brevo is not configured");
    }

    const confirmUrl = buildConfirmUrl(email, name);
    const greeting = name ? `Hi ${name},` : "Hi,";
    const expiryHours = Math.round(CONFIRM_WINDOW_MS / (60 * 60 * 1000));
    const subject = `${SITE_NAME}: confirm your subscription`;

    const htmlContent = `<!doctype html>
<html>
    <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">
            <tr>
                <td align="center">
                    <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px;max-width:92%;background:#ffffff;border-radius:12px;padding:28px;">
                        <tr>
                            <td style="font-size:22px;line-height:1.3;color:#111827;font-weight:700;">Confirm your subscription</td>
                        </tr>
                        <tr>
                            <td style="padding-top:14px;font-size:16px;line-height:1.6;color:#1f2937;">${greeting}<br/>Please confirm to receive the weekly digest.</td>
                        </tr>
                        <tr>
                            <td style="padding-top:18px;">
                                <a href="${confirmUrl}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">Confirm subscription</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top:12px;font-size:13px;line-height:1.6;color:#6b7280;">This link expires in ${expiryHours} hours. If you did not request this, you can ignore this email.</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            sender: { email: senderEmail, name: senderName },
            to: [{ email, name: name || undefined }],
            subject,
            htmlContent,
        }),
        cache: "no-store",
    });

    if (!response.ok) {
        const details = toDetails(await response.text());
        throw new ProviderError("brevo", response.status, details);
    }
}

function getClientIp(req: Request): string {
    const header = req.headers.get("x-forwarded-for") || "";
    const first = header.split(",")[0]?.trim();
    return first || "unknown";
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hitRateLimit(ip: string): boolean {
    const now = Date.now();
    const bucket = ipBuckets.get(ip) ?? [];
    const recent = bucket.filter((ts) => now - ts < WINDOW_MS);
    recent.push(now);
    ipBuckets.set(ip, recent);
    return recent.length > MAX_PER_WINDOW;
}

async function subscribeWithKit(name: string, email: string): Promise<void> {
    const formId = process.env.KIT_FORM_ID;
    const apiKey = process.env.KIT_API_KEY;

    if (!formId || !apiKey) {
        throw new Error("Kit is not configured");
    }

    const response = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            api_key: apiKey,
            email,
            first_name: name || undefined,
        }),
        cache: "no-store",
    });

    if (!response.ok) {
        const details = toDetails(await response.text());
        throw new ProviderError("kit", response.status, details);
    }
}

async function subscribeWithButtondown(name: string, email: string): Promise<void> {
    const apiKey = process.env.BUTTONDOWN_API_KEY;

    if (!apiKey) {
        throw new Error("Buttondown is not configured");
    }

    const response = await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            email,
            tags: ["website"],
            metadata: name ? { first_name: name } : undefined,
        }),
        cache: "no-store",
    });

    if (!response.ok && response.status !== 409) {
        const details = toDetails(await response.text());
        throw new ProviderError("buttondown", response.status, details);
    }
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
        const details = toDetails(await response.text());
        throw new ProviderError("brevo", response.status, details);
    }
}

export async function POST(req: Request): Promise<Response> {
    const ip = getClientIp(req);

    if (hitRateLimit(ip)) {
        return NextResponse.json(
            { ok: false, message: "Too many attempts. Please wait a few minutes and try again." },
            { status: 429 }
        );
    }

    let body: SubscribeBody;

    try {
        body = (await req.json()) as SubscribeBody;
    } catch {
        return NextResponse.json(
            { ok: false, message: "Invalid request payload." },
            { status: 400 }
        );
    }

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const company = (body.company ?? "").trim();

    if (company) {
        return NextResponse.json({ ok: true });
    }

    if (!email || !isValidEmail(email)) {
        return NextResponse.json(
            { ok: false, message: "Please enter a valid email address." },
            { status: 400 }
        );
    }

    if (name.length > 100) {
        return NextResponse.json(
            { ok: false, message: "Name is too long." },
            { status: 400 }
        );
    }

    const provider = (process.env.NEWSLETTER_PROVIDER || "brevo").toLowerCase();

    try {
        if (provider === "brevo") {
            await sendBrevoConfirmationEmail(name, email);
        } else if (provider === "buttondown") {
            await subscribeWithButtondown(name, email);
        } else {
            await subscribeWithKit(name, email);
        }

        return NextResponse.json({
            ok: true,
            message:
                provider === "brevo"
                    ? "Please check your email to confirm your subscription."
                    : "Subscription received.",
        });
    } catch (error) {
        const ref = `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

        if (error instanceof ProviderError) {
            console.error("Subscribe provider error", {
                ref,
                provider: error.provider,
                status: error.status,
                details: error.details,
            });

            if (isDebugMode()) {
                return NextResponse.json(
                    {
                        ok: false,
                        message: `Subscribe failed (${error.provider} ${error.status}): ${error.details}`,
                        ref,
                    },
                    { status: 502 }
                );
            }
        } else {
            console.error("Subscribe unknown error", { ref, error });
        }

        return NextResponse.json(
            {
                ok: false,
                message: `Could not subscribe right now. Please try again in a minute. (Ref: ${ref})`,
            },
            { status: 502 }
        );
    }
}
