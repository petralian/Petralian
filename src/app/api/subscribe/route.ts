import { NextResponse } from "next/server";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const ipBuckets = new Map<string, number[]>();

interface SubscribeBody {
    name?: string;
    email?: string;
    company?: string;
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
        throw new Error(`Kit subscribe failed: ${response.status}`);
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
        throw new Error(`Buttondown subscribe failed: ${response.status}`);
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
        throw new Error(`Brevo subscribe failed: ${response.status}`);
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
            await subscribeWithBrevo(name, email);
        } else if (provider === "buttondown") {
            await subscribeWithButtondown(name, email);
        } else {
            await subscribeWithKit(name, email);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Subscribe error", error);
        return NextResponse.json(
            {
                ok: false,
                message: "Could not subscribe right now. Please try again in a minute.",
            },
            { status: 502 }
        );
    }
}
