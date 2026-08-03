import crypto from "crypto";
import { NextResponse } from "next/server";
import {
    buildWeeklyDigestHtml,
    buildWeeklyDigestSubject,
} from "@/lib/newsletter-digest-email";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";

interface BrevoContact {
    email: string;
    attributes?: { FIRSTNAME?: string };
    emailBlacklisted?: boolean;
}

function getSecret(req: Request): string {
    const auth = req.headers.get("authorization") || "";
    if (auth.toLowerCase().startsWith("bearer ")) {
        return auth.slice(7).trim();
    }
    const url = new URL(req.url);
    return url.searchParams.get("secret")?.trim() || "";
}

function assertAuthorized(req: Request): boolean {
    const expected = process.env.CRON_SECRET || "";
    if (!expected) return false;
    const provided = getSecret(req);
    return Boolean(provided && provided === expected);
}

function signUnsubscribeToken(email: string): string {
    const secret = process.env.UNSUBSCRIBE_SECRET || "";
    if (!secret) throw new Error("UNSUBSCRIBE_SECRET is missing");
    return crypto
        .createHmac("sha256", secret)
        .update(email.toLowerCase())
        .digest("hex");
}

function getDigestPosts() {
    const now = Date.now();
    const lookbackMs = 8 * 24 * 60 * 60 * 1000;
    return getAllPosts().filter((post) => {
        const ts = new Date(post.date).getTime();
        return Number.isFinite(ts) && now - ts <= lookbackMs;
    });
}

async function getBrevoContacts(apiKey: string, listId?: number): Promise<BrevoContact[]> {
    const contacts: BrevoContact[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
        const base = listId
            ? `https://api.brevo.com/v3/contacts/lists/${listId}/contacts`
            : "https://api.brevo.com/v3/contacts";
        const url = `${base}?limit=${limit}&offset=${offset}`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "api-key": apiKey,
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error(`Could not fetch Brevo contacts: ${res.status}`);
        }

        const json = (await res.json()) as {
            contacts?: BrevoContact[];
            count?: number;
        };
        const chunk = Array.isArray(json.contacts) ? json.contacts : [];
        contacts.push(...chunk);

        if (chunk.length < limit) break;
        offset += limit;
    }

    return contacts.filter((c) => c.email && !c.emailBlacklisted);
}

function buildDigestHtml(recipientEmail: string, recipientName: string | undefined, posts: ReturnType<typeof getDigestPosts>): string {
    const unsubscribeToken = signUnsubscribeToken(recipientEmail);
    const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}&token=${unsubscribeToken}`;
    return buildWeeklyDigestHtml({ recipientName, posts, unsubscribeUrl });
}

async function sendBrevoDigest(
    apiKey: string,
    to: BrevoContact,
    posts: ReturnType<typeof getDigestPosts>
): Promise<void> {
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@petralian.com";
    const senderName = process.env.BREVO_SENDER_NAME || SITE_NAME;
    const recipientEmail = to.email.toLowerCase();
    const recipientName = to.attributes?.FIRSTNAME;
    const unsubscribeToken = signUnsubscribeToken(recipientEmail);
    const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}&token=${unsubscribeToken}`;

    const subject = buildWeeklyDigestSubject(posts.length);
    const htmlContent = buildDigestHtml(recipientEmail, recipientName, posts);

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            sender: { email: senderEmail, name: senderName },
            to: [{ email: recipientEmail, name: recipientName }],
            subject,
            htmlContent,
            headers: {
                "List-Unsubscribe": `<${unsubscribeUrl}>`,
            },
        }),
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Brevo send failed: ${res.status}`);
    }
}

export async function GET(req: Request): Promise<Response> {
    if (!assertAuthorized(req)) {
        return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ ok: false, message: "BREVO_API_KEY is missing" }, { status: 500 });
    }

    const posts = getDigestPosts();
    if (posts.length === 0) {
        return NextResponse.json({ ok: true, sent: 0, skipped: true, reason: "No posts in lookback window" });
    }

    const rawListId = process.env.BREVO_LIST_ID;
    const listId = rawListId ? Number(rawListId) : undefined;
    const contacts = await getBrevoContacts(apiKey, Number.isFinite(listId) ? listId : undefined);

    const dailyCap = Number(process.env.BREVO_DAILY_LIMIT || "300");
    const recipients = contacts.slice(0, Number.isFinite(dailyCap) ? dailyCap : 300);

    let sent = 0;
    const failures: string[] = [];

    for (const recipient of recipients) {
        try {
            await sendBrevoDigest(apiKey, recipient, posts);
            sent += 1;
        } catch {
            failures.push(recipient.email);
        }
    }

    return NextResponse.json({
        ok: true,
        posts: posts.length,
        recipientsConsidered: contacts.length,
        recipientsAttempted: recipients.length,
        sent,
        failed: failures.length,
    });
}
