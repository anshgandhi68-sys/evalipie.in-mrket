"use client";

import React from 'react';
import MetroHero from '../ui/scroll-locked-video-hero.js';

// ─────────────────────────────────────────────────────────────
// EVALIPIE ENTRY SCROLL ANIMATION — Scroll-Locked Video Hero
//
// Powered by the scroll-scrubbed video hero as demonstrated
// in the 21st.dev screen recording:
// "THE CITY OPENS" -> Doors swing open -> "Every door in the city is already open."
// Wheel/touch input smoothly drives playback currentTime with RAF interpolation.
// ─────────────────────────────────────────────────────────────

export const DoorHero: React.FC<{
  videoSrc?: string;
  title?: string;
  tagline?: string;
  scrollHint?: string;
}> = ({
  videoSrc = "/assets/metro-hero.mp4",
  title = "Welcome to Evalipie",
  tagline = "Every door in the city is already open.",
  scrollHint = "SCROLL TO ENTER",
}) => {
  return (
    <section id="hero-entry" className="relative w-full overflow-hidden">
      <MetroHero
        videoSrc={videoSrc}
        title={title}
        tagline={tagline}
        scrollHint={scrollHint}
        autoUnlock={true}
        showSkipButton={true}
        scrubDistance={2800}
        signature={{
          name: "Evalipie Marketplace",
          url: "https://evalipie.in"
        }}
        onComplete={() => {
          const feed = document.getElementById('marketplace-feed');
          if (feed) {
            feed.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
    </section>
  );
};

export default DoorHero;
