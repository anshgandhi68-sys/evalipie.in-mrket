"use client";

import React, { useEffect, useRef } from 'react';
import './DoorHero.css';

// ─────────────────────────────────────────────────────────────
// EVALIPIE ARCHITECTURAL 3D DOOR SCROLL HERO
// Daytime storefront with sunshine, glass reflections, and 3D door entry
// ─────────────────────────────────────────────────────────────

export const DoorHero: React.FC<{
  onEnter?: () => void;
}> = ({ onEnter }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dlRef = useRef<HTMLDivElement>(null);
  const drRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const c1Ref = useRef<HTMLElement>(null);
  const c2Ref = useRef<HTMLElement>(null);
  const c3Ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    const world = worldRef.current;
    const frame = frameRef.current;
    const dl = dlRef.current;
    const dr = drRef.current;
    const intro = introRef.current;
    const controls = controlsRef.current;
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
      void world.offsetHeight; // Force reflow
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

    let rafId: number | null = null;

    const update = () => {
      const total = hero.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = clamp(-hero.getBoundingClientRect().top / total, 0, 1);

      // 1. Door rotation (0 -> 0.35)
      const a = ease(clamp(p / 0.35, 0, 1));
      dl.style.transform = `rotateY(${a * 108}deg)`;
      dr.style.transform = `rotateY(${-a * 108}deg)`;

      // 2. Camera zoom through doorway (0.28 -> 0.95)
      const e = ease(clamp((p - 0.28) / 0.65, 0, 1));
      world.style.transform = `translate(${(window.innerWidth / 2 - cx) * e}px, ${(window.innerHeight / 2 - cy) * e}px) scale(${1 + (S - 1) * e})`;

      // 3. Intro fade & slide
      if (intro) {
        intro.style.opacity = String(1 - clamp(p / 0.18, 0, 1));
        intro.style.transform = `translateY(${-p * 70}px)`;
      }

      // 4. Controls fade
      if (controls) {
        controls.style.opacity = String(1 - clamp(p * 6, 0, 1));
        controls.style.pointerEvents = p > 0.1 ? 'none' : 'auto';
      }

      // 5. Progress bar
      if (bar) {
        bar.style.transform = `scaleX(${p})`;
      }

      // 6. Clouds parallax
      if (c1) c1.style.marginLeft = `${-p * 70}px`;
      if (c2) c2.style.marginLeft = `${-p * 110}px`;
      if (c3) c3.style.marginLeft = `${-p * 150}px`;
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measure);
    
    // Initial measure after layout settles
    measure();
    const t = setTimeout(measure, 150);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(t);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const handleOpenDoors = () => {
    if (!heroRef.current) return;
    const heroTop = heroRef.current.getBoundingClientRect().top + window.scrollY;
    // Scroll ~50% into hero to open doors and initiate zoom
    window.scrollTo({
      top: heroTop + (heroRef.current.offsetHeight * 0.45),
      behavior: 'smooth'
    });
  };

  const handleSkipToStore = () => {
    const feed = document.getElementById('marketplace-feed') || document.getElementById('cats');
    if (feed) {
      feed.scrollIntoView({ behavior: 'smooth' });
    } else if (heroRef.current) {
      window.scrollTo({
        top: heroRef.current.offsetHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="hero" ref={heroRef}>
      <div className="stage" id="top" ref={stageRef}>
        {/* Daytime Sunny Sky */}
        <div className="sky">
          <i className="sun" title="Morning Sunshine" />
          <div className="sun-rays" />
          <i className="cloud c1" ref={c1Ref} />
          <i className="cloud c2" ref={c2Ref} />
          <i className="cloud c3" ref={c3Ref} />
        </div>

        {/* Intro Typography — Safely placed in the clear sky with zero overlap */}
        <div className="intro" id="intro" ref={introRef}>
          <p className="eyebrow">evalipie.in</p>
          <h1>
            Every Shop.
            <em>One Intelligent Marketplace.</em>
          </h1>
        </div>

        {/* 3D Storefront Building */}
        <div className="world" id="world" ref={worldRef}>
          <div className="wall">
            <div className="sign">Evalipie</div>
            
            {/* Display Windows with Daytime Sunshine Sheen */}
            <div className="win l">
              🎧
              <small>ELECTRONICS</small>
            </div>
            <div className="win r">
              🏠
              <small>HOME</small>
            </div>

            {/* Frame and Interior */}
            <div className="frame" id="frame" ref={frameRef}>
              <div className="inside">
                <div className="in-hd">
                  <b>Evalipie</b>
                  <span>Bengaluru ▾</span>
                </div>
                <h2>Find exactly what you need.</h2>
                <p>From every shop.</p>
                <div className="in-search">
                  <span>Describe what you need…</span>
                  <u>✦ AI</u>
                </div>
                <div className="in-row">
                  <span>🎧</span>
                  <span>🎙️</span>
                  <span>⌨️</span>
                </div>
              </div>

              {/* 3D Doors */}
              <div className="door dl" id="dl" ref={dlRef} />
              <div className="door dr" id="dr" ref={drRef} />
            </div>
          </div>
        </div>

        <div className="ground" />

        {/* Interactive Bottom Control Buttons */}
        <div className="hero-controls" ref={controlsRef}>
          <button 
            type="button" 
            className="hint" 
            onClick={handleOpenDoors}
            title="Click or scroll to open the door"
          >
            Scroll to open the door ↓
          </button>
          <button 
            type="button" 
            className="skip-btn" 
            onClick={handleSkipToStore}
            title="Skip straight to verified catalogue"
          >
            Skip to Store →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bar"><i id="bar" ref={barRef} /></div>
      </div>
    </section>
  );
};

export default DoorHero;
