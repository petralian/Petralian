// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "master";
var config_default = defineConfig({
  branch,
  // Leave null for local-only dev. Add TinaCloud credentials to use cloud editing:
  //   NEXT_PUBLIC_TINA_CLIENT_ID  (from app.tina.io)
  //   TINA_TOKEN                  (from app.tina.io)
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? null,
  token: process.env.TINA_TOKEN ?? null,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public"
    }
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
            required: true
          },
          {
            type: "string",
            name: "slug",
            label: "Slug",
            description: "URL-safe identifier (e.g. my-post-title)"
          },
          {
            type: "datetime",
            name: "date",
            label: "Date"
          },
          {
            type: "string",
            name: "status",
            label: "Status",
            options: ["published", "draft"]
          },
          {
            type: "string",
            name: "category",
            label: "Category"
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true
          },
          {
            type: "string",
            name: "excerpt",
            label: "Excerpt",
            ui: {
              component: "textarea"
            }
          },
          {
            type: "image",
            name: "featured_image",
            label: "Featured Image"
          },
          {
            type: "string",
            name: "featured_image_alt",
            label: "Featured Image Alt Text"
          },
          {
            type: "string",
            name: "focus_keyword",
            label: "Focus Keyword"
          },
          {
            type: "string",
            name: "seo_title",
            label: "SEO Title"
          },
          {
            type: "string",
            name: "meta_description",
            label: "Meta Description",
            ui: {
              component: "textarea"
            }
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
