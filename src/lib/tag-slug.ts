export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getTopicUrl(tag: string): string {
  return `/topics/${tagToSlug(tag)}`;
}
