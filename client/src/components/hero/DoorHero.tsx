"use client";

import React, { useEffect, useRef } from 'react';
import './DoorHero.css';

// ─────────────────────────────────────────────────────────────
// EVALIPIE ARCHITECTURAL 3D DOOR SCROLL HERO
// Exactly matching Evalipie prototype reference
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
  const hintRef = useRef<HTMLDivElement>(null);
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
      S = Math.max(window.innerWidth / fw, window.innerHeight / fh) * 1.06;
      update();
    };

    const update = () => {
      const total = hero.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = clamp(-hero.getBoundingClientRect().top / total, 0, 1);

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
        hint.style.opacity = String(1 - clamp(p * 10, 0, 1));
      }

      // 5. Progress bar
      if (bar) {
        bar.style.transform = `scaleX(${p})`;
      }

      // 6. Clouds parallax
      if (c1) c1.style.marginLeft = `${-p * 60}px`;
      if (c2) c2.style.marginLeft = `${-p * 100}px`;
      if (c3) c3.style.marginLeft = `${-p * 140}px`;
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', measure);
    measure();

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section id="hero" ref={heroRef}>
      <div className="stage" id="top" ref={stageRef}>
        <div className="sky">
          <i className="sun" />
          <i className="cloud c1" ref={c1Ref} />
          <i className="cloud c2" ref={c2Ref} />
          <i className="cloud c3" ref={c3Ref} />
        </div>
        <div className="intro" id="intro" ref={introRef}>
          <p className="eyebrow">evalipie.in</p>
          <h1>Every Shop.<br /><em>One Intelligent Marketplace.</em></h1>
        </div>
        <div className="world" id="world" ref={worldRef}>
          <div className="wall">
            <div className="sign">Evalipie</div>
            <div className="win l">🎧<small>ELECTRONICS</small></div>
            <div className="win r">🏠<small>HOME</small></div>
            <div className="frame" id="frame" ref={frameRef}>
              <div className="inside">
                <div className="in-hd"><b>Evalipie</b><span>Bengaluru ▾</span></div>
                <h2>Find exactly what you need.</h2>
                <p>From every shop.</p>
                <div className="in-search">Describe what you need… <u>✦ AI</u></div>
                <div className="in-row"><span>🎧</span><span>🎙️</span><span>⌨️</span></div>
              </div>
              <div className="door dl" id="dl" ref={dlRef} />
              <div className="door dr" id="dr" ref={drRef} />
            </div>
          </div>
        </div>
        <div className="ground" />
        <div className="hint" id="hint" ref={hintRef}>Scroll to open the door ↓</div>
        <div className="bar"><i id="bar" ref={barRef} /></div>
      </div>
    </section>
  );
};

export default DoorHero;
