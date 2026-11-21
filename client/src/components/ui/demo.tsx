"use client";

import React from "react";
import ClothingRailHero from "@/components/ui/product-rail-gallery";
import type { RailGarment } from "@/components/ui/product-rail-gallery";
import MetroHero from "@/components/ui/scroll-locked-video-hero";
import { RAIL_DEMO_ITEMS } from "@/components/ui/clothing-rail-demo";

export { RAIL_DEMO_ITEMS };

export function MetroHeroDemo() {
  return <MetroHero />;
}

export function DemoOne({ autoplay = true }: { autoplay?: boolean }) {
  return (
    <div data-rail-demo className="flex min-h-svh w-full items-center justify-center bg-background text-foreground py-12 px-4 sm:px-6">
      <div className="w-full max-w-6xl">
        <ClothingRailHero
          items={RAIL_DEMO_ITEMS}
          hanger="none"
          eyebrow="Local Boutique Edit · Ten curated garments on the rail"
          heading="Handpicked local apparel. Inspect every seam right on the rail."
          caption="Brush along the rail, slide a hanger, or click a garment to rotate and inspect front & back."
          autoplay={autoplay}
          action={
            <a
              href="/products?category=fashion"
              className="rounded-full bg-[#0F1412] px-6 py-3 text-sm font-semibold text-white shadow-sm outline-none transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-gray-400 motion-reduce:transition-none"
            >
              Explore Local Boutique Apparel
            </a>
          }
        />
      </div>
    </div>
  );
}

export default DemoOne;
