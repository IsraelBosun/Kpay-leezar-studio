"use client";
import { useRef } from 'react';

const marqueeImages = [
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop&q=80",
];

export default function MarqueeStrip() {
  const doubled = [...marqueeImages, ...marqueeImages];

  return (
    <div className="w-full overflow-hidden py-6 bg-white border-y border-gray-100">
      <div className="flex gap-4 animate-marquee w-max">
        {doubled.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-64 h-40 overflow-hidden grayscale hover:grayscale-0 transition-all duration-500"
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
