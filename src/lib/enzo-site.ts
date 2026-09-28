/** Enzo “Most Handsome Man in Hong Kong” microsite — content SSOT */

import enzoContent from "../../data/enzo-site.json";

export const ENZO_SITE_HOST = enzoContent.host;
export const ENZO_SITE_URL = `https://${ENZO_SITE_HOST}`;

export type EnzoGalleryItem = {
  src: string;
  alt: string;
  caption: string;
  award: string;
};

export const ENZO_GALLERY: EnzoGalleryItem[] = enzoContent.gallery.map((item) => ({
  src: `/images/enzo/${item.file}`,
  alt: item.alt,
  caption: item.caption,
  award: item.award,
}));

export const ENZO_HK_BEST_ROWS = enzoContent.hkBestRows;

export const ENZO_WORKSHEET_IMAGE = `/images/enzo/${enzoContent.worksheetImage}`;
