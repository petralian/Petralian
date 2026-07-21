import type { ImgHTMLAttributes } from "react";
import { getImageDimensions } from "@/lib/image-dimensions";

export default function ProseImage({
  src,
  alt,
  className,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement>) {
  if (!src || typeof src !== "string") return null;

  const dims = getImageDimensions(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      width={dims?.width}
      height={dims?.height}
      loading="lazy"
      decoding="async"
      className={className}
      {...rest}
    />
  );
}
