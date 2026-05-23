import { defineConfig } from "tinacms";

const branch =
    process.env.NEXT_PUBLIC_TINA_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "master";

export default defineConfig({
    branch,
    // Leave null for local-only dev. Add TinaCloud credentials to use cloud editing:
    //   NEXT_PUBLIC_TINA_CLIENT_ID  (from app.tina.io)
    //   TINA_TOKEN                  (from app.tina.io)
    clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? null,
    token: process.env.TINA_TOKEN ?? null,

    build: {
        outputFolder: "admin",
        publicFolder: "public",
    },

    media: {
        tina: {
            mediaRoot: "images/posts",
            publicFolder: "public",
        },
    },

    schema: {
        collections: [
            {
                name: "post",
                label: "Posts",
                path: "content/posts",
                format: "md",
                fields: [
                    {
                        type: "string",
                        name: "title",
                        label: "Title",
                        isTitle: true,
                        required: true,
                    },
                    {
                        type: "string",
                        name: "slug",
                        label: "Slug",
                        description: "URL-safe identifier (e.g. my-post-title)",
                    },
                    {
                        type: "datetime",
                        name: "date",
                        label: "Date",
                    },
                    {
                        type: "string",
                        name: "status",
                        label: "Status",
                        options: ["published", "draft"],
                    },
                    {
                        type: "string",
                        name: "category",
                        label: "Category",
                    },
                    {
                        type: "string",
                        name: "tags",
                        label: "Tags",
                        list: true,
                    },
                    {
                        type: "string",
                        name: "excerpt",
                        label: "Excerpt",
                        ui: {
                            component: "textarea",
                        },
                    },
                    {
                        type: "image",
                        name: "featured_image",
                        label: "Featured Image",
                    },
                    {
                        type: "string",
                        name: "featured_image_alt",
                        label: "Featured Image Alt Text",
                    },
                    {
                        type: "string",
                        name: "focus_keyword",
                        label: "Focus Keyword",
                    },
                    {
                        type: "string",
                        name: "seo_title",
                        label: "SEO Title",
                    },
                    {
                        type: "string",
                        name: "meta_description",
                        label: "Meta Description",
                        ui: {
                            component: "textarea",
                        },
                    },
                    {
                        type: "rich-text",
                        name: "body",
                        label: "Body",
                        isBody: true,
                    },
                ],
            },
            {
                name: "homePage",
                label: "Home Page",
                path: "content/pages",
                match: { include: "home" },
                format: "json",
                fields: [
                    {
                        type: "string",
                        name: "hero_title",
                        label: "Hero Title",
                    },
                    {
                        type: "string",
                        name: "hero_tagline",
                        label: "Hero Tagline",
                        ui: { component: "textarea" },
                    },
                    {
                        type: "string",
                        name: "intro_bio",
                        label: "Intro Bio",
                        ui: { component: "textarea" },
                    },
                ],
            },
            {
                name: "aboutPage",
                label: "About Page",
                path: "content/pages",
                match: { include: "about" },
                format: "json",
                fields: [
                    {
                        type: "string",
                        name: "hero_tagline",
                        label: "Hero Tagline",
                        ui: { component: "textarea" },
                    },
                    {
                        type: "string",
                        name: "bio_paragraphs",
                        label: "Bio Paragraphs",
                        list: true,
                        ui: { component: "textarea" },
                    },
                    {
                        type: "object",
                        name: "pillars",
                        label: "Capability Pillars",
                        list: true,
                        fields: [
                            { type: "string", name: "label", label: "Label" },
                            { type: "string", name: "title", label: "Title" },
                            {
                                type: "string",
                                name: "text",
                                label: "Text",
                                ui: { component: "textarea" },
                            },
                        ],
                    },
                ],
            },
            {
                name: "writingPage",
                label: "Writing Page",
                path: "content/pages",
                match: { include: "writing" },
                format: "json",
                fields: [
                    {
                        type: "string",
                        name: "header_title",
                        label: "Header Title",
                    },
                    {
                        type: "string",
                        name: "header_description",
                        label: "Header Description",
                        ui: { component: "textarea" },
                    },
                    {
                        type: "object",
                        name: "topic_cards",
                        label: "Topic Cards",
                        list: true,
                        fields: [
                            { type: "string", name: "title", label: "Title" },
                            {
                                type: "string",
                                name: "description",
                                label: "Description",
                                ui: { component: "textarea" },
                            },
                            {
                                type: "string",
                                name: "style",
                                label: "Style",
                                options: ["dark", "light"],
                            },
                        ],
                    },
                ],
            },
        ],
    },
});
