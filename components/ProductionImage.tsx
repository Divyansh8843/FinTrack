"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductionImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  fallback?: string;
}

export default function ProductionImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  fallback = "/logo.png",
}: ProductionImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  // If it's a static image from public folder, use regular img tag
  if (src.startsWith("/") && !src.includes("http")) {
    return (
      <img
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  // For external images, use Next.js Image component
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
      unoptimized={false}
    />
  );
}
