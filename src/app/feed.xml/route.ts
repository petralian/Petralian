import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";

export const revalidate = 3600;

function escapeXml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export function GET(): Response {
    const posts = getAllPosts().slice(0, 50);
    const buildDate = new Date().toUTCString();

    const items = posts
        .map((post) => {
            const link = `${SITE_URL}/posts/${post.slug}`;
            const pubDate = new Date(post.date).toUTCString();
            const description = post.seo_description || post.excerpt || "";

            return [
                "<item>",
                `<title>${escapeXml(post.title)}</title>`,
                `<link>${escapeXml(link)}</link>`,
                `<guid>${escapeXml(link)}</guid>`,
                `<pubDate>${escapeXml(pubDate)}</pubDate>`,
                `<description>${escapeXml(description)}</description>`,
                "</item>",
            ].join("");
        })
        .join("");

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0">',
        "<channel>",
        `<title>${escapeXml(SITE_NAME)}</title>`,
        `<link>${escapeXml(SITE_URL)}</link>`,
        `<description>${escapeXml(`${SITE_NAME} writing feed`)}</description>`,
        `<lastBuildDate>${escapeXml(buildDate)}</lastBuildDate>`,
        `<language>en-us</language>`,
        items,
        "</channel>",
        "</rss>",
    ].join("");

    return new Response(xml, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
