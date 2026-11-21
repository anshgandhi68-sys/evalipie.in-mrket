"use client";

import React from 'react';
import MetroHero from '../ui/scroll-locked-video-hero.js';

// ─────────────────────────────────────────────────────────────
// EVALIPIE DAYLIGHT SUNSHINE SCROLL HERO
//
// Native sticky track (220vh) with smooth hardware-accelerated
// scroll scrubbing:
// - Closed doors in morning sunlight with volumetric god-rays
// - Scroll down naturally scrubs doors opening smoothly
// - Golden morning sunlight streams through carriage windows
// - Reaching the end transitions smoothly into the marketplace feed
// - Zero body locks, zero preventDefault, 60fps fluid performance
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
    <div id="hero-entry" className="relative w-full h-[220vh] bg-[#080B12]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <MetroHero
          videoSrc={videoSrc}
          title={title}
          tagline={tagline}
          scrollHint={scrollHint}
          showSkipButton={true}
          onComplete={() => {
            const feed = document.getElementById('marketplace-feed');
            if (feed) {
              feed.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      </div>
    </div>
  );
};

export default DoorHero;
