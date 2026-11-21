"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './DoorHero.css';

// ─────────────────────────────────────────────────────────────
// EVALIPIE ARCHITECTURAL 3D DOOR SCROLL HERO & DISCOVERY PORTAL
// Exactly matching prototype reference with 100% functional search,
// real interactive city dropdown, categories, and prompt chips.
// ─────────────────────────────────────────────────────────────

export interface DoorHeroProps {
  onSelectCategory?: (catKey: string) => void;
  onSearch?: (query: string) => void;
}

const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'];

const QUICK_CATS = [
  { key: 'AUDIO', name: 'Electronics & Audio', icon: '🎧' },
  { key: 'LAPTOPS', name: 'Computers & Laptops', icon: '💻' },
  { key: 'MOBILES', name: 'Mobiles & Gadgets', icon: '📱' },
  { key: 'HOME & KITCHEN', name: 'Home & Kitchen', icon: '🍳' },
  { key: 'FOOTWEAR', name: 'Lifestyle & Footwear', icon: '👟' },
];

const PROMPT_CHIPS = [
  'Clear audio for online meetings under ₹3,000',
  'Laptop for programming under ₹60,000',
  'Compact kitchen appliance for apartment',
  'Wireless keyboard for work',
];

export const DoorHero: React.FC<DoorHeroProps> = ({ onSelectCategory, onSearch }) => {
  const { activeCity, setActiveCity } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

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
  const insideRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

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
    const inside = insideRef.current;
    const portal = portalRef.current;

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

      // 3. Intro fade & slide up (0 -> 0.16)
      if (intro) {
        const introOpacity = 1 - clamp(p / 0.16, 0, 1);
        intro.style.opacity = String(introOpacity);
        intro.style.transform = `translateY(${-p * 80}px)`;
        intro.style.visibility = introOpacity <= 0.01 ? 'hidden' : 'visible';
        intro.style.pointerEvents = introOpacity < 0.5 ? 'none' : 'auto';
      }

      // 4. Miniature interior preview fade out as camera approaches doorway (0.32 -> 0.48)
      if (inside) {
        const insideOpacity = 1 - clamp((p - 0.32) / 0.16, 0, 1);
        inside.style.opacity = String(insideOpacity);
      }

      // 5. Full-bleed interactive portal fade in as camera crosses threshold (0.46 -> 0.72)
      if (portal) {
        const pStart = 0.46;
        const pFull = 0.72;
        const portalOpacity = clamp((p - pStart) / (pFull - pStart), 0, 1);
        portal.style.opacity = String(portalOpacity);
        portal.style.pointerEvents = portalOpacity > 0.4 ? 'auto' : 'none';
        portal.style.transform = `translateY(${(1 - portalOpacity) * 20}px)`;
      }

      // 5. Hint button fade
      if (hint) {
        const hintOpacity = 1 - clamp(p * 10, 0, 1);
        hint.style.opacity = String(hintOpacity);
        hint.style.pointerEvents = p > 0.08 ? 'none' : 'auto';
      }

      // 6. Progress bar
      if (bar) {
        bar.style.transform = `scaleX(${p})`;
      }

      // 7. Parallax clouds
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

  const handleSubmitSearch = (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : searchInput).trim();
    if (!q) return;
    onSearch?.(q);
    const aiSec = document.getElementById('ai');
    if (aiSec) {
      aiSec.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" ref={heroRef}>
      <div className="stage" id="top" ref={stageRef}>
        
        {/* Daytime Sky with Morning Sunshine & Parallax Clouds (Matching Screenshot 5) */}
        <div className="sky">
          <i className="sun" />
          <i className="cloud c1" ref={c1Ref} />
          <i className="cloud c2" ref={c2Ref} />
          <i className="cloud c3" ref={c3Ref} />
        </div>

        {/* Intro Headline (Clear in sky above building facade, zero overlap) */}
        <div className="intro" id="intro" ref={introRef}>
          <p className="eyebrow">evalipie.in</p>
          <h1>
            Every Shop.<br />
            <em>One Intelligent Marketplace.</em>
          </h1>
        </div>

        {/* 3D Storefront Building (Matching Screenshot 5) */}
        <div className="world" id="world" ref={worldRef}>
          <div className="wall">
            <div className="sign">Evalipie</div>
            
            {/* Display Windows (Matching Screenshot 3) */}
            <div 
              className="win l cursor-pointer"
              title="Click to explore Electronics & Audio"
              onClick={() => {
                onSelectCategory?.('AUDIO');
                document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="win-icon">🎧</span>
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
              <span className="win-icon">🏠</span>
              <small>HOME</small>
            </div>

            {/* Frame and Interior Preview */}
            <div className="frame" id="frame" ref={frameRef}>
              <div className="inside" ref={insideRef}>
                <div className="in-hd">
                  <b>Evalipie</b>
                  <span>{activeCity} ▾</span>
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

              {/* 3D Rotating Doors */}
              <div className="door dl" id="dl" ref={dlRef} />
              <div className="door dr" id="dr" ref={drRef} />
            </div>
          </div>
        </div>

        {/* Full-bleed, Crisp, High-Resolution Interactive Discovery Portal */}
        {/* Smoothly fades in at p >= 0.38 as the user enters through the doors */}
        <div 
          className="portal-interior" 
          id="portalInterior" 
          ref={portalRef}
          style={{ opacity: 0, pointerEvents: 'none' }}
        >
          <div className="portal-container">
            {/* Top Bar with City Selector & Live Indicator */}
            <div className="portal-topbar">
              <div className="portal-brand">
                <span className="brand-badge">EVALIPIE AI</span>
                <div className="relative inline-block text-left">
                  <button 
                    type="button" 
                    className="city-btn"
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    title="Change Delivery City"
                  >
                    <span>📍 {activeCity}</span>
                    <span className="text-[10px] ml-1">▾</span>
                  </button>
                  {isCityDropdownOpen && (
                    <div className="city-dropdown-menu">
                      {CITIES.map(c => (
                        <button
                          key={c}
                          type="button"
                          className={`city-dropdown-item ${c === activeCity ? 'active' : ''}`}
                          onClick={() => {
                            setActiveCity(c);
                            setIsCityDropdownOpen(false);
                          }}
                        >
                          <span>{c}</span>
                          {c === activeCity && <span className="text-xs text-[#167D73] font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="portal-status">
                <span className="status-dot"></span>
                <span>4 Verified Stores Online · Real-Time Stock</span>
              </div>
            </div>

            {/* Headline */}
            <div className="portal-header">
              <h2>Find exactly what you need.</h2>
              <p>One intelligent search across every neighborhood shop.</p>
            </div>

            {/* Real Interactive Search Bar */}
            <form 
              className="portal-search-form" 
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitSearch();
              }}
            >
              <div className="portal-search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text"
                  className="portal-input"
                  placeholder="Describe what you need… (e.g. wireless headphones under ₹2,000)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit" className="portal-submit-btn">
                  <span>✦ Ask AI</span>
                </button>
              </div>
            </form>

            {/* Quick Interactive Category Pills */}
            <div className="portal-categories">
              <span className="cat-label">POPULAR:</span>
              {QUICK_CATS.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  className="portal-cat-btn"
                  onClick={() => {
                    onSelectCategory?.(cat.key);
                    document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Interactive Prompt Chips */}
            <div className="portal-chips">
              {PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="portal-chip-btn"
                  onClick={() => {
                    setSearchInput(chip);
                    handleSubmitSearch(chip);
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Bottom Navigation CTA */}
            <button 
              type="button" 
              className="portal-scroll-cta"
              onClick={() => {
                document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Explore verified local inventory below</span>
              <span>↓</span>
            </button>
          </div>
        </div>

        <div className="ground" />

        {/* Bottom Scroll Pill Button (Matching Screenshot 5) */}
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

