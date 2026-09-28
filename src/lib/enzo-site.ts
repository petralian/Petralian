/** Enzo “Most Handsome Man in Hong Kong” microsite — content SSOT */

export const ENZO_SITE_HOST = "enzo.petralian.com";
export const ENZO_SITE_URL = `https://${ENZO_SITE_HOST}`;

export type EnzoGalleryItem = {
  src: string;
  alt: string;
  caption: string;
  award: string;
};

export const ENZO_GALLERY: EnzoGalleryItem[] = [
  {
    src: "/images/enzo/bowtie-globe.jpg",
    alt: "Enzo in bow tie and suspenders holding a globe",
    caption: "International diplomacy requires bare feet and a pink bow tie.",
    award: "Global Icon of the Year",
  },
  {
    src: "/images/enzo/school-polo.jpg",
    alt: "Enzo in a yellow school polo smiling at the camera",
    caption: "Official school portrait energy. The committee has spoken.",
    award: "People’s Choice (Self-Selected)",
  },
  {
    src: "/images/enzo/ny-camera.jpg",
    alt: "Enzo with a toy camera on an orange lanyard",
    caption: "Paparazzi training complete. Please do not look directly at the lens.",
    award: "Best Red-Carpet Stare",
  },
  {
    src: "/images/enzo/beach-ice-cream.jpg",
    alt: "Enzo on the beach making a dramatic face with an ice cream bar",
    caption: "Summer couture: GAP tee, duck face, dessert accessory.",
    award: "Most Photogenic Bite",
  },
  {
    src: "/images/enzo/hearts-stage.jpg",
    alt: "Enzo hugged by his sister in front of a heart backdrop",
    caption: "Fan club president confirmed. Hearts optional but encouraged.",
    award: "Highest Fan Approval Rating",
  },
  {
    src: "/images/enzo/couch-laugh.jpg",
    alt: "Enzo laughing on the sofa holding a remote",
    caption: "Candid laughter captured mid-acceptance speech rehearsal.",
    award: "Best Unscripted Moment",
  },
  {
    src: "/images/enzo/duck-face-duo.jpg",
    alt: "Enzo and his sister making duck faces on a bed",
    caption: "Sibling symmetry module activated.",
    award: "Excellence in Lip Geometry",
  },
  {
    src: "/images/enzo/glamour-extra.jpg",
    alt: "Enzo portrait",
    caption: "Additional evidence filed with the registry.",
    award: "Honourable Mention (Still Handsome)",
  },
];

export const ENZO_HK_BEST_ROWS = [
  { label: "Highest mountain", value: "Tai Mo Shan" },
  { label: "Largest island", value: "Lantau Island" },
  { label: "Tallest building", value: "ICC (环球贸易广场)" },
  { label: "Most handsome man", value: "Enzo!!! 😎" },
];
