"use client";

import React, { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────
// EVALIPIE ARCHITECTURAL 3D DOOR SCROLL HERO
//
// 100% Hardware-Accelerated 3D Transform Animation:
// - Crisp daylight morning sky with radiant sun, lens glint, and drifting clouds
// - Atmospheric sunshine rays streaming from top-right onto storefront windows
// - Architectural brickwork storefront with "Evalipie Storefront" signage
// - Display windows with sunshine glass reflection (Electronics & Smart Tech)
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
  title = "Every Shop.",
  tagline = "One Intelligent Marketplace.",
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
        {/* 1. Daylight Sky: Radiant Morning Sun, Sunshine Rays & Clouds */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Radiant Morning Sun */}
          <div
            className="absolute right-[12%] top-[10%] w-[100px] h-[100px] rounded-full z-0"
            style={{
              background: 'radial-gradient(circle, #FFFDEB 25%, #FFE58F 65%, rgba(255, 229, 143, 0) 100%)',
              boxShadow: '0 0 110px 40px rgba(255, 229, 143, 0.55)',
            }}
          />

          {/* Atmospheric Sunshine Beam Overlay (Sunshine from Window Act) */}
          <div
            className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 85% 15%, rgba(255, 248, 220, 0.6) 0%, rgba(255, 243, 196, 0.25) 40%, transparent 75%)',
            }}
          />

          {/* Drifting Clouds */}
          <i
            ref={c1Ref}
            className="absolute left-[7%] top-[18%] h-[34px] w-[130px] rounded-[40px] bg-white opacity-90 blur-[0.5px]"
            style={{ willChange: 'transform' }}
          >
            <span className="absolute w-[52px] h-[52px] left-[18px] -top-[24px] bg-white rounded-full block" />
            <span className="absolute w-[40px] h-[40px] left-[65px] -top-[16px] bg-white rounded-full block" />
          </i>

          <i
            ref={c2Ref}
            className="absolute left-[54%] top-[8%] h-[34px] w-[120px] rounded-[40px] bg-white opacity-80 blur-[0.5px]"
            style={{ willChange: 'transform' }}
          >
            <span className="absolute w-[48px] h-[48px] left-[18px] -top-[22px] bg-white rounded-full block" />
            <span className="absolute w-[36px] h-[36px] left-[60px] -top-[15px] bg-white rounded-full block" />
          </i>

          <i
            ref={c3Ref}
            className="absolute left-[28%] top-[28%] h-[30px] w-[110px] rounded-[40px] bg-white opacity-70 blur-[0.5px]"
            style={{ willChange: 'transform' }}
          >
            <span className="absolute w-[44px] h-[44px] left-[16px] -top-[20px] bg-white rounded-full block" />
            <span className="absolute w-[34px] h-[34px] left-[54px] -top-[14px] bg-white rounded-full block" />
          </i>
        </div>

        {/* 2. Intro Typography (Sitting cleanly in the clear sky with ZERO overlap) */}
        <div
          ref={introRef}
          className="absolute top-[calc(64px+2.5vh)] left-0 right-0 text-center px-4 z-10 pointer-events-none max-w-4xl mx-auto"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.2em] uppercase text-[#105B55] bg-white/90 px-3.5 py-1 rounded-full mb-2 shadow-xs border border-white/60 backdrop-blur-sm">
            <span>✦</span>
            <span>evalipie.in · Bengaluru Hyperlocal</span>
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.08]">
            {title}{' '}
            <span className="text-[#167D73] font-black">{tagline}</span>
          </h1>
        </div>

        {/* 3. 3D World (Storefront Wall, Windows, Awning, Doors, Interior) */}
        <div
          ref={worldRef}
          className="absolute inset-0"
          style={{ willChange: 'transform' }}
        >
          {/* Storefront Building Wall (Proportioned to stay comfortably below the headline) */}
          <div
            className="absolute left-1/2 bottom-[6vh] -translate-x-1/2 w-[min(92vw,840px)] h-[min(48vh,460px)] rounded-t-[22px] shadow-2xl relative overflow-visible"
            style={{
              background: 'linear-gradient(180deg, #1b9285, #167D73)',
              boxShadow: '0 30px 60px rgba(16, 91, 85, 0.3)',
            }}
          >
            {/* Subtle Architectural Brickwork Lines */}
            <div
              className="absolute inset-0 rounded-t-[22px] pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 34px)',
              }}
            />

            {/* Storefront Signboard */}
            <div
              className="absolute top-[4%] left-1/2 -translate-x-1/2 bg-white text-[#105B55] font-black text-xs sm:text-lg tracking-wider px-6 py-1.5 rounded-xl shadow-md border border-gray-100 uppercase"
            >
              Evalipie Storefront
            </div>

            {/* Display Window Left: Electronics (With Sunshine Glass Glint Act) */}
            <div
              className="absolute bottom-[10%] left-[6%] w-[21%] h-[36%] rounded-xl flex flex-col items-center justify-center border-[5px] border-[#0c3d39] shadow-inner overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #D9F1F8, #ffffff 65%, #FFF8E1 100%)' }}
            >
              {/* Sunshine Glass Reflection Gleam */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(125deg, rgba(255,255,255,0.7) 0%, rgba(255,244,180,0.4) 35%, transparent 60%)',
                }}
              />
              <span className="text-2xl sm:text-3xl relative z-10 drop-shadow-xs">🎧</span>
              <span className="text-[10px] font-extrabold text-[#105B55] mt-1 relative z-10 hidden sm:block">
                Sony · Bose ANC
              </span>
              <small className="absolute -bottom-[22px] text-[9px] sm:text-[10px] font-black text-white tracking-widest uppercase">
                Electronics
              </small>
            </div>

            {/* Display Window Right: Smart Tech & Accessories (With Sunshine Glass Glint Act) */}
            <div
              className="absolute bottom-[10%] right-[6%] w-[21%] h-[36%] rounded-xl flex flex-col items-center justify-center border-[5px] border-[#0c3d39] shadow-inner overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #D9F1F8, #ffffff 65%, #FFF8E1 100%)' }}
            >
              {/* Sunshine Glass Reflection Gleam */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(125deg, rgba(255,255,255,0.7) 0%, rgba(255,244,180,0.4) 35%, transparent 60%)',
                }}
              />
              <span className="text-2xl sm:text-3xl relative z-10 drop-shadow-xs">⚡</span>
              <span className="text-[10px] font-extrabold text-[#105B55] mt-1 relative z-10 hidden sm:block">
                65W GaN · Mics
              </span>
              <small className="absolute -bottom-[22px] text-[9px] sm:text-[10px] font-black text-white tracking-widest uppercase">
                Smart Tech
              </small>
            </div>

            {/* Central Doorway Frame with 3D Perspective */}
            <div
              ref={frameRef}
              className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[76%] aspect-[0.62] rounded-t-[14px] border-[6px] border-b-0 border-[#0c3d39]"
              style={{
                perspective: '1100px',
                background: '#0c3d39',
              }}
            >
              {/* Striped Awning Accent */}
              <div
                className="absolute -left-[14%] -right-[14%] -top-[30px] h-[26px] rounded-t-[8px] shadow-sm z-20"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, #ffffff 0 20px, #E9F7F3 20px 40px)',
                  boxShadow: '0 5px 0 #0c3d39',
                }}
              />

              {/* Inside Store Interior (Revealed when doors swing open) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center overflow-hidden"
                style={{
                  background:
                    'radial-gradient(120% 70% at 50% 0%, #E9F7F3, #F7F9FC 70%)',
                }}
              >
                {/* Store mini header */}
                <div className="absolute top-0 left-0 right-0 flex justify-between px-3 py-1.5 bg-white/95 border-b border-gray-200 text-[10px] font-bold">
                  <span className="text-[#105B55]">Evalipie Marketplace</span>
                  <span className="text-gray-500">Indiranagar ▾</span>
                </div>

                <div className="space-y-0.5 mt-4">
                  <h3 className="text-sm sm:text-lg font-black text-gray-900 leading-tight">
                    Find Exactly What You Need
                  </h3>
                  <p className="text-[11px] font-bold text-[#167D73]">
                    From 142 Real Neighbourhood Stores
                  </p>
                </div>

                {/* Simulated Search Pill */}
                <div className="w-full max-w-[190px] bg-white border border-gray-200 rounded-full px-2.5 py-1 flex items-center justify-between text-[9px] text-gray-500 shadow-xs mt-1">
                  <span>Search local tech & audio…</span>
                  <span className="bg-[#167D73] text-white px-2 py-0.5 rounded-full font-bold">
                    ✦ Go
                  </span>
                </div>

                {/* Local Category Icons Row */}
                <div className="flex gap-1.5 mt-1">
                  <span className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-sm">
                    🎧
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-sm">
                    🎙️
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-sm">
                    ⚡
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
                {/* Door Daylight Glass Inset */}
                <div
                  className="absolute inset-[9%_14%_40%] rounded-md border-[3px] border-[#0c3d39] overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, #D9F1F8, #ffffff 60%, #FFF8E1)',
                  }}
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(120deg, rgba(255,255,255,0.6) 0%, rgba(255,244,180,0.3) 40%, transparent 70%)'
                    }}
                  />
                </div>
                {/* Brass Door Handle */}
                <div
                  className="absolute top-[56%] right-[8px] w-[8px] h-[22%] rounded-md bg-[#F3D27A] shadow-md border border-amber-600/30"
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
                {/* Door Daylight Glass Inset */}
                <div
                  className="absolute inset-[9%_14%_40%] rounded-md border-[3px] border-[#0c3d39] overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, #D9F1F8, #ffffff 60%, #FFF8E1)',
                  }}
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(120deg, rgba(255,255,255,0.6) 0%, rgba(255,244,180,0.3) 40%, transparent 70%)'
                    }}
                  />
                </div>
                {/* Brass Door Handle */}
                <div
                  className="absolute top-[56%] left-[8px] w-[8px] h-[22%] rounded-md bg-[#F3D27A] shadow-md border border-amber-600/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Sidewalk Ground */}
        <div
          className="absolute left-0 right-0 bottom-0 h-[6vh] border-t-[3px] border-white pointer-events-none"
          style={{ background: 'linear-gradient(180deg, #D8DEE6, #C7CFDA)' }}
        />

        {/* 5. Scroll Down Hint / Fast Skip Button */}
        <div className="absolute bottom-[calc(6vh+12px)] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
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
