"use client";

import React, { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────
// EVALIPIE ARCHITECTURAL 3D DOOR SCROLL HERO
//
// 100% Hardware-Accelerated 3D Transform Animation:
// - Crisp daylight morning sky with radiant sun and drifting clouds
// - Brickwork storefront with "Evalipie" sign and display windows
// - Striped awning & 3D doorway frame with 1100px perspective
// - Dual swinging doors with beveled glass and brass handles
// - Phase 1 (0 -> 0.32): 3D doors swing open (rotateY 108deg)
// - Phase 2 (0.3 -> 0.92): Camera zooms through the doorway (scale & translate)
// - Seamlessly reveals the smart Amazon / Flipkart marketplace feed below
// - ZERO video decoding lag, zero AI-generated artifacts, 60-120fps fluid
// ─────────────────────────────────────────────────────────────

export const DoorHero: React.FC<{
  title?: string;
  tagline?: string;
  onEnter?: () => void;
}> = ({
  title = "Welcome to Evalipie",
  tagline = "Every Shop. One Intelligent Marketplace.",
  onEnter
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dlRef = useRef<HTMLDivElement>(null);
  const drRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const c1Ref = useRef<HTMLElement>(null);
  const c2Ref = useRef<HTMLElement>(null);
  const c3Ref = useRef<HTMLElement>(null);

  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    const world = worldRef.current;
    const frame = frameRef.current;
    const dl = dlRef.current;
    const dr = drRef.current;
    const intro = introRef.current;
    const hint = hintRef.current;
    const bar = barRef.current;
    const c1 = c1Ref.current;
    const c2 = c2Ref.current;
    const c3 = c3Ref.current;

    if (!hero || !stage || !world || !frame || !dl || !dr) return;

    let cx = 0;
    let cy = 0;
    let S = 4;
    let fw = 1;
    let fh = 1;

    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const measure = () => {
      world.style.transform = 'none';
      const r = frame.getBoundingClientRect();
      fw = r.width;
      fh = r.height;
      cx = r.left + r.width / 2;
      const st = stage.getBoundingClientRect().top;
      cy = r.top - st + r.height / 2;
      world.style.transformOrigin = `${cx}px ${cy}px`;
      S = Math.max(window.innerWidth / fw, window.innerHeight / fh) * 1.08;
      update();
    };

    const update = () => {
      const total = hero.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = clamp(-hero.getBoundingClientRect().top / total, 0, 1);

      if (p > 0.05 && !hasScrolled) {
        setHasScrolled(true);
      }

      // 1. Door rotation (0 -> 0.32)
      const a = ease(clamp(p / 0.32, 0, 1));
      dl.style.transform = `rotateY(${a * 108}deg)`;
      dr.style.transform = `rotateY(${-a * 108}deg)`;

      // 2. Camera zoom through doorway (0.30 -> 0.92)
      const e = ease(clamp((p - 0.3) / 0.62, 0, 1));
      world.style.transform = `translate(${(window.innerWidth / 2 - cx) * e}px, ${(window.innerHeight / 2 - cy) * e}px) scale(${1 + (S - 1) * e})`;

      // 3. Intro fade & slide
      if (intro) {
        intro.style.opacity = String(1 - clamp(p / 0.16, 0, 1));
        intro.style.transform = `translateY(${-p * 80}px)`;
      }

      // 4. Hint fade
      if (hint) {
        hint.style.opacity = String(1 - clamp(p * 8, 0, 1));
      }

      // 5. Progress bar
      if (bar) {
        bar.style.transform = `scaleX(${p})`;
      }

      // 6. Cloud parallax
      if (c1) c1.style.transform = `translateX(${-p * 80}px)`;
      if (c2) c2.style.transform = `translateX(${-p * 140}px) scale(0.7)`;
      if (c3) c3.style.transform = `translateX(${-p * 200}px) scale(0.5)`;
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', measure);
    measure();

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', measure);
    };
  }, [hasScrolled]);

  const scrollToMarketplace = () => {
    onEnter?.();
    const feed = document.getElementById('marketplace-feed');
    if (feed) {
      feed.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" ref={heroRef} className="relative w-full h-[460vh] select-none">
      {/* ── STICKY STAGE (100vh viewport) ────────────────────────────── */}
      <div
        id="top"
        ref={stageRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-gradient-to-b from-[#BFE6F7] via-[#E3F4FA] to-[#F7F9FC]"
      >
        {/* 1. Daylight Sky: Radiant Sun & Clouds */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Sun */}
          <div
            className="absolute right-[12%] top-[12%] w-[90px] h-[90px] rounded-full"
            style={{
              background: 'radial-gradient(circle, #FFF4C2 30%, #FFE08A 70%)',
              boxShadow: '0 0 90px 30px rgba(255, 224, 138, 0.55)',
            }}
          />

          {/* Cloud 1 */}
          <i
            ref={c1Ref}
            className="absolute left-[8%] top-[22%] h-[34px] w-[120px] rounded-[40px] bg-white opacity-90 blur-[0.5px]"
            style={{ willChange: 'transform' }}
          >
            <span className="absolute w-[50px] h-[50px] left-[18px] -top-[24px] bg-white rounded-full block" />
            <span className="absolute w-[38px] h-[38px] left-[60px] -top-[16px] bg-white rounded-full block" />
          </i>

          {/* Cloud 2 */}
          <i
            ref={c2Ref}
            className="absolute left-[58%] top-[12%] h-[34px] w-[120px] rounded-[40px] bg-white opacity-80 blur-[0.5px]"
            style={{ willChange: 'transform' }}
          >
            <span className="absolute w-[50px] h-[50px] left-[18px] -top-[24px] bg-white rounded-full block" />
            <span className="absolute w-[38px] h-[38px] left-[60px] -top-[16px] bg-white rounded-full block" />
          </i>

          {/* Cloud 3 */}
          <i
            ref={c3Ref}
            className="absolute left-[30%] top-[34%] h-[34px] w-[120px] rounded-[40px] bg-white opacity-70 blur-[0.5px]"
            style={{ willChange: 'transform' }}
          >
            <span className="absolute w-[50px] h-[50px] left-[18px] -top-[24px] bg-white rounded-full block" />
            <span className="absolute w-[38px] h-[38px] left-[60px] -top-[16px] bg-white rounded-full block" />
          </i>
        </div>

        {/* 2. Intro Typography */}
        <div
          ref={introRef}
          className="absolute top-[calc(8vh+35px)] left-0 right-0 text-center px-4 z-10 pointer-events-none"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase text-[#105B55] bg-white/80 px-4 py-1.5 rounded-full mb-3 shadow-xs border border-white/40 backdrop-blur-xs">
            evalipie.in · Bengaluru Local Marketplace
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.05]">
            {title}
            <br />
            <em className="not-italic text-[#167D73] font-black">{tagline}</em>
          </h1>
        </div>

        {/* 3. 3D World (Storefront Wall, Doors, and Interior) */}
        <div
          ref={worldRef}
          className="absolute inset-0"
          style={{ willChange: 'transform' }}
        >
          {/* Storefront Wall */}
          <div
            className="absolute left-1/2 bottom-[8vh] -translate-x-1/2 w-[min(94vw,860px)] h-[min(60vh,620px)] rounded-t-[24px] shadow-2xl relative overflow-visible"
            style={{
              background: 'linear-gradient(180deg, #1b9285, #167D73)',
              boxShadow: '0 30px 60px rgba(16, 91, 85, 0.3)',
            }}
          >
            {/* Subtle Brickwork Lines */}
            <div
              className="absolute inset-0 rounded-t-[24px] pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 38px)',
              }}
            />

            {/* Store Signboard */}
            <div
              className="absolute top-[5%] left-1/2 -translate-x-1/2 bg-white text-[#105B55] font-black text-sm sm:text-xl tracking-tight px-6 py-1.5 rounded-xl shadow-md border border-gray-100 uppercase"
            >
              Evalipie Storefront
            </div>

            {/* Display Window Left: Electronics */}
            <div
              className="absolute bottom-[10%] left-[6%] w-[20%] h-[34%] rounded-xl flex flex-col items-center justify-center border-[6px] border-[#105B55] shadow-inner"
              style={{ background: 'linear-gradient(135deg, #D9F1F8, #ffffff)' }}
            >
              <span className="text-2xl sm:text-4xl">🎧</span>
              <small className="absolute -bottom-[26px] text-[10px] sm:text-[11px] font-extrabold text-white tracking-wider uppercase">
                Electronics
              </small>
            </div>

            {/* Display Window Right: Tech & Living */}
            <div
              className="absolute bottom-[10%] right-[6%] w-[20%] h-[34%] rounded-xl flex flex-col items-center justify-center border-[6px] border-[#105B55] shadow-inner"
              style={{ background: 'linear-gradient(135deg, #D9F1F8, #ffffff)' }}
            >
              <span className="text-2xl sm:text-4xl">⚡</span>
              <small className="absolute -bottom-[26px] text-[10px] sm:text-[11px] font-extrabold text-white tracking-wider uppercase">
                Smart Tech
              </small>
            </div>

            {/* Door Frame with 3D Perspective */}
            <div
              ref={frameRef}
              className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[76%] aspect-[0.62] rounded-t-[16px] border-[7px] border-b-0 border-[#105B55]"
              style={{
                perspective: '1100px',
                background: '#0c3d39',
              }}
            >
              {/* Striped Awning Accent */}
              <div
                className="absolute -left-[14%] -right-[14%] -top-[34px] h-[30px] rounded-t-[10px] shadow-sm z-20"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, #ffffff 0 22px, #E9F7F3 22px 44px)',
                  boxShadow: '0 6px 0 #105B55',
                }}
              />

              {/* Inside Store Interior (Revealed when doors swing open) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center overflow-hidden"
                style={{
                  background:
                    'radial-gradient(120% 70% at 50% 0%, #E9F7F3, #F7F9FC 70%)',
                }}
              >
                {/* Store mini header */}
                <div className="absolute top-0 left-0 right-0 flex justify-between px-4 py-2 bg-white/95 border-b border-gray-200 text-[11px] font-bold">
                  <span className="text-[#105B55]">Evalipie Marketplace</span>
                  <span className="text-gray-500">Indiranagar ▾</span>
                </div>

                <div className="space-y-1 mt-6">
                  <h3 className="text-base sm:text-xl font-black text-gray-900 leading-tight">
                    Find Exactly What You Need
                  </h3>
                  <p className="text-xs font-bold text-[#167D73]">
                    From 142 Real Neighbourhood Stores
                  </p>
                </div>

                {/* Simulated Search Pill */}
                <div className="w-full max-w-[200px] bg-white border border-gray-200 rounded-full px-3 py-1.5 flex items-center justify-between text-[10px] text-gray-500 shadow-xs mt-2">
                  <span>Search local tech & audio…</span>
                  <span className="bg-[#167D73] text-white px-2 py-0.5 rounded-full font-bold">
                    ✦ Go
                  </span>
                </div>

                {/* Local Category Icons Row */}
                <div className="flex gap-2 mt-2">
                  <span className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-lg">
                    🎧
                  </span>
                  <span className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-lg">
                    🎙️
                  </span>
                  <span className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-lg">
                    ⌨️
                  </span>
                </div>
              </div>

              {/* Left 3D Door */}
              <div
                ref={dlRef}
                className="absolute top-0 bottom-0 left-0 w-1/2 border-[3px] border-[#0c3d39] z-10"
                style={{
                  background: 'linear-gradient(90deg, #105B55, #1a8479)',
                  transformOrigin: 'left center',
                  backfaceVisibility: 'visible',
                  willChange: 'transform',
                }}
              >
                {/* Door Glass Inset */}
                <div
                  className="absolute inset-[9%_14%_40%] rounded-lg border-[4px] border-[#0c3d39]"
                  style={{
                    background:
                      'linear-gradient(135deg, #D9F1F8, #ffffff 60%, #BFE6F7)',
                  }}
                />
                {/* Brass Door Handle */}
                <div
                  className="absolute top-[56%] right-[10px] w-[9px] h-[22%] rounded-md bg-[#F3D27A] shadow-md border border-amber-600/30"
                />
              </div>

              {/* Right 3D Door */}
              <div
                ref={drRef}
                className="absolute top-0 bottom-0 right-0 w-1/2 border-[3px] border-[#0c3d39] z-10"
                style={{
                  background: 'linear-gradient(90deg, #105B55, #1a8479)',
                  transformOrigin: 'right center',
                  backfaceVisibility: 'visible',
                  willChange: 'transform',
                }}
              >
                {/* Door Glass Inset */}
                <div
                  className="absolute inset-[9%_14%_40%] rounded-lg border-[4px] border-[#0c3d39]"
                  style={{
                    background:
                      'linear-gradient(135deg, #D9F1F8, #ffffff 60%, #BFE6F7)',
                  }}
                />
                {/* Brass Door Handle */}
                <div
                  className="absolute top-[56%] left-[10px] w-[9px] h-[22%] rounded-md bg-[#F3D27A] shadow-md border border-amber-600/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Sidewalk Ground */}
        <div
          className="absolute left-0 right-0 bottom-0 h-[8vh] border-t-[3px] border-white pointer-events-none"
          style={{ background: 'linear-gradient(180deg, #D8DEE6, #C7CFDA)' }}
        />

        {/* 5. Scroll Down Hint / Fast Skip Button */}
        <div className="absolute bottom-[calc(8vh+14px)] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          <div
            ref={hintRef}
            className="bg-[#111827] text-white text-[11px] font-black tracking-[0.14em] uppercase px-5 py-2.5 rounded-full shadow-lg border border-white/10 animate-bounce"
            style={{ willChange: 'opacity' }}
          >
            Scroll to open the door ↓
          </div>
          <button
            onClick={scrollToMarketplace}
            className="bg-white/90 hover:bg-white text-gray-800 text-[11px] font-bold px-3.5 py-2 rounded-full shadow-md border border-gray-200 transition-all cursor-pointer backdrop-blur-xs"
          >
            Skip to Store →
          </button>
        </div>

        {/* 6. Top/Bottom Progress Scrub Line */}
        <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-black/10 z-30 pointer-events-none">
          <div
            ref={barRef}
            className="h-full bg-[#167D73] origin-left"
            style={{ transform: 'scaleX(0)', willChange: 'transform' }}
          />
        </div>
      </div>
    </section>
  );
};

export default DoorHero;
