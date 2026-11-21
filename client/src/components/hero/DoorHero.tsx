"use client";

import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './DoorHero.css';

export interface DoorHeroProps {
  onSelectCategory?: (catKey: string) => void;
  onSearch?: (query: string) => void;
}

export const DoorHero: React.FC<DoorHeroProps> = ({ onSelectCategory, onSearch }) => {
  const { activeCity } = useAuth();

  const heroRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dlRef = useRef<HTMLDivElement>(null);
  const drRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLButtonElement>(null);
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
      void world.offsetHeight; // Force layout reflow
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

    let rafId: number | null = null;

    const update = () => {
      const total = hero.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = clamp(-hero.getBoundingClientRect().top / total, 0, 1);

      // 1. Door opening rotation (0 -> 0.32)
      const a = ease(clamp(p / 0.32, 0, 1));
      dl.style.transform = `rotateY(${a * 108}deg)`;
      dr.style.transform = `rotateY(${-a * 108}deg)`;

      // 2. Camera zoom through doorway (0.30 -> 0.92)
      const e = ease(clamp((p - 0.30) / 0.62, 0, 1));
      world.style.transform = `translate(${(window.innerWidth / 2 - cx) * e}px, ${(window.innerHeight / 2 - cy) * e}px) scale(${1 + (S - 1) * e})`;

      // 3. Intro text fade & slide up (0 -> 0.16)
      if (intro) {
        const introOpacity = 1 - clamp(p / 0.16, 0, 1);
        intro.style.opacity = String(introOpacity);
        intro.style.transform = `translateY(${-p * 80}px)`;
      }

      // 4. Hint button fade
      if (hint) {
        hint.style.opacity = String(1 - clamp(p * 10, 0, 1));
      }

      // 5. Progress bar
      if (bar) {
        bar.style.transform = `scaleX(${p})`;
      }

      // 6. Parallax clouds
      if (c1) c1.style.marginLeft = `${-p * 60}px`;
      if (c2) c2.style.marginLeft = `${-p * 100}px`;
      if (c3) c3.style.marginLeft = `${-p * 140}px`;
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measure);
    
    // Initial measurement
    measure();
    const timer = setTimeout(measure, 100);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const handleOpenDoors = () => {
    const aiSection = document.getElementById('ai');
    if (aiSection) {
      aiSection.scrollIntoView({ behavior: 'smooth' });
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
        
        {/* Daytime Sky with Morning Sunshine & Parallax Clouds */}
        <div className="sky">
          <i className="sun" />
          <i className="cloud c1" ref={c1Ref} />
          <i className="cloud c2" ref={c2Ref} />
          <i className="cloud c3" ref={c3Ref} />
        </div>

        {/* Intro Headline */}
        <div className="intro" id="intro" ref={introRef}>
          <p className="eyebrow">evalipie.in</p>
          <h1>
            Every Shop.<br />
            <em>One Intelligent Marketplace.</em>
          </h1>
        </div>

        {/* 3D Storefront Building */}
        <div className="world" id="world" ref={worldRef}>
          <div className="wall">
            <div className="sign">Evalipie</div>
            
            {/* Display Windows */}
            <div 
              className="win l cursor-pointer"
              title="Click to explore Electronics & Audio"
              onClick={() => {
                onSelectCategory?.('AUDIO');
                document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <small>ELECTRONICS</small>
            </div>
            <div 
              className="win r cursor-pointer"
              title="Click to explore Home & Kitchen"
              onClick={() => {
                onSelectCategory?.('HOME & KITCHEN');
                document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <small>HOME</small>
            </div>

            {/* Frame and Interior Preview */}
            <div 
              className="frame cursor-pointer" 
              id="frame" 
              ref={frameRef}
              title="Enter Evalipie Marketplace"
              onClick={handleOpenDoors}
            >
              <div className="inside">
                <div className="in-hd">
                  <b>Evalipie</b>
                  <span>{activeCity || 'Bengaluru'} ▾</span>
                </div>
                <h2>Find exactly what you need.</h2>
                <p>From every shop.</p>
                <div 
                  className="in-search"
                  onClick={(e) => {
                    e.stopPropagation();
                    const aiInput = document.getElementById('ai-search-input') || document.getElementById('ai');
                    aiInput?.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => (document.getElementById('ai-search-input') as HTMLInputElement)?.focus(), 400);
                  }}
                >
                  <span>Describe what you need…</span>
                  <u>AI Search</u>
                </div>
                <div className="in-row">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory?.('AUDIO');
                      document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    AUDIO
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory?.('MOBILES');
                      document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    MOBILES
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory?.('LAPTOPS');
                      document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    LAPTOPS
                  </button>
                </div>
              </div>

              {/* 3D Rotating Doors */}
              <div className="door dl" id="dl" ref={dlRef} />
              <div className="door dr" id="dr" ref={drRef} />
            </div>
          </div>
        </div>

        <div className="ground" />

        {/* Bottom Scroll Pill Button */}
        <button 
          type="button" 
          className="hint" 
          id="hint" 
          ref={hintRef}
          onClick={handleOpenDoors}
        >
          Scroll to open the door ↓
        </button>

        {/* Progress Bar */}
        <div className="bar"><i id="bar" ref={barRef} /></div>
      </div>
    </section>
  );
};

export default DoorHero;
