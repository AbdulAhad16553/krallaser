"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const HERO_IMAGES = [
  { src: "/coverr%20web.jpg.jpeg", alt: "TOOLS - Imported Cutting Tools" },
  { src: "/coverr%20webb.jpg.jpeg", alt: "Krallaser metal fiber laser cutting solutions Pakistan" },
  { src: "/web%201.jpg.jpeg", alt: "Krallaser laser cutting machines showroom Lahore" },
  { src: "/web%202.jpg.jpeg", alt: "Fiber laser cutting machine and control system" },
  { src: "/web%203.jpg.jpeg", alt: "POWER - Industrial Machines" },
];

const INTERVAL_MS = 5000;

export function HeroImageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 rounded-2xl overflow-hidden">
      {HERO_IMAGES.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      ))}
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "bg-white w-6"
                : "bg-white/60 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
