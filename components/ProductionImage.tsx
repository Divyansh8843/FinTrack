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

  // Always use Next.js Image (local and external) to satisfy lint and optimize
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
