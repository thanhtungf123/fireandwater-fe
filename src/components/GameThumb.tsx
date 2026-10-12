"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Thumbnail with a graceful gradient fallback when the remote image 404s,
 * so a broken provider image never shows the browser's "broken image" icon.
 */
export default function GameThumb({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-400 via-fuchsia-500 to-blue-600">
        <span className="text-3xl drop-shadow">🔥💧</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      loading="lazy"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="object-cover transition duration-300 group-hover:scale-110"
      onError={() => setFailed(true)}
    />
  );
}
