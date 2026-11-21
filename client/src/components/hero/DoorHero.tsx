import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowDown, Sparkles, ShieldCheck, Headphones, Store, Laptop, ShoppingBag } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// EVALIPIE DOOR HERO — Scroll-locked 3D door entry animation
//
// Inspired by the 21st.dev "The City Opens" scroll-scrub hero.
// The page is PINNED (body position:fixed) while this hero is
// active. Wheel/touch input is captured and drives the animation
// progress from 0→1. The doors swing open, the camera dollies
// forward through the entrance, and once the animation completes
// the page unlocks and normal scrolling resumes. If the user
// scrolls back up into the hero, it re-locks.
//
// Architecture:
//   Phase 0.00–0.05: Intro text visible, hint bouncing
//   Phase 0.05–0.30: Intro text fades out + moves up
//   Phase 0.10–0.55: Doors swing open (rotateY 0→110°)
//   Phase 0.30–0.90: Camera dolly zoom into the doorway
//   Phase 0.70–0.90: Interior content fades in
//   Phase 0.92+:     Auto-release scroll lock → page continues
// ─────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

// Smooth easeInOutCubic
function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const DoorHero: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const interiorRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    if (!section || !viewport) return;

    const SCRUB_DISTANCE = 2800; // px of scroll input to complete animation
    let targetProgress = 0;
    let currentProgress = 0;
    let rafId = 0;
    let locked = false;
    let lockedScrollY = 0;
    let touchStartY = 0;
    let hasStartedScrolling = false;
    let hasCompleted = false;

    // ── Scroll Lock (body pinned) ──────────────────────────
    function engageLock() {
      if (locked || typeof document === 'undefined') return;
      locked = true;
      lockedScrollY = window.scrollY;
      const b = document.body.style;
      b.position = 'fixed';
      b.top = `-${lockedScrollY}px`;
      b.left = '0';
      b.right = '0';
      b.width = '100%';
      b.overscrollBehavior = 'none';
    }

    function releaseLock() {
      if (!locked || typeof document === 'undefined') return;
      locked = false;
      const y = lockedScrollY;
      const b = document.body.style;
      b.position = '';
      b.top = '';
      b.left = '';
      b.right = '';
      b.width = '';
      b.overscrollBehavior = '';
      window.scrollTo(0, y);
    }

    // ── Re-lock on scroll back up ──────────────────────────
    function checkReenter() {
      if (locked || hasCompleted || !section) return;
      const rect = section.getBoundingClientRect();
      // If the hero section top is near the viewport top, re-engage
      if (rect.top >= -10 && rect.top <= 50) {
        targetProgress = 0;
        engageLock();
      }
    }

    // Start locked
    engageLock();

    // ── Input handlers ─────────────────────────────────────
    function addDelta(deltaY: number) {
      targetProgress = clamp(targetProgress + deltaY / SCRUB_DISTANCE, 0, 1);
      if (targetProgress > 0.005) hasStartedScrolling = true;
    }

    const onWheel = (e: WheelEvent) => {
      if (!locked) {
        checkReenter();
        return;
      }
      addDelta(e.deltaY);
      e.preventDefault();
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!locked) {
        checkReenter();
        return;
      }
      const y = e.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - y;
      touchStartY = y;
      addDelta(deltaY);
      e.preventDefault();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    // ── Animation frame loop ───────────────────────────────
    function frame() {
      // Smooth interpolation (like the reference: 0.18 lerp factor)
      currentProgress += (targetProgress - currentProgress) * 0.12;

      const p = currentProgress;

      // 1. Intro headline: fade out between 0.05–0.30
      if (introRef.current) {
        const introT = 1 - clamp((p - 0.03) / 0.22, 0, 1);
        introRef.current.style.opacity = String(introT);
        introRef.current.style.transform = `translateY(${(1 - introT) * -40}px) scale(${0.95 + introT * 0.05})`;
        introRef.current.style.filter = `blur(${(1 - introT) * 6}px)`;
      }

      // 2. Scroll hint: fade out as soon as scrolling starts
      if (hintRef.current) {
        hintRef.current.style.opacity = hasStartedScrolling ? '0' : '1';
      }

      // 3. Doors swing open: 0.10–0.55
      const doorFactor = ease(clamp((p - 0.10) / 0.45, 0, 1));
      const doorAngle = doorFactor * 110;
      if (leftDoorRef.current) {
        leftDoorRef.current.style.transform = `rotateY(${doorAngle}deg)`;
      }
      if (rightDoorRef.current) {
        rightDoorRef.current.style.transform = `rotateY(${-doorAngle}deg)`;
      }

      // 4. Camera dolly zoom: 0.25–0.92
      //    Scale the world container and translate up to simulate flying into the doorway
      if (worldRef.current) {
        const zoomFactor = ease(clamp((p - 0.25) / 0.67, 0, 1));
        const scale = 1 + zoomFactor * 4.5;
        // The focal point should be the door center, so we translate the world
        // so the door area (at ~65% from top of viewport) moves toward center
        const translateY = zoomFactor * -18; // move world UP as we zoom in
        worldRef.current.style.transform = `scale(${scale}) translateY(${translateY}%)`;
      }

      // 5. Interior glow: fades in 0.35–0.70
      if (interiorRef.current) {
        const interiorT = clamp((p - 0.35) / 0.35, 0, 1);
        interiorRef.current.style.opacity = String(interiorT);
      }

      // 6. White overlay fade in at the very end (0.80–0.95) to mask the transition
      if (overlayRef.current) {
        const overlayT = clamp((p - 0.80) / 0.15, 0, 1);
        overlayRef.current.style.opacity = String(overlayT);
      }

      // 7. Progress bar
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${p})`;
      }

      // 8. Release at ~0.95 and auto-scroll to marketplace
      if (p >= 0.93 && !hasCompleted) {
        hasCompleted = true;
        setCompleted(true);
        releaseLock();
        // Smooth scroll into marketplace content
        requestAnimationFrame(() => {
          const feed = document.getElementById('marketplace-feed');
          if (feed) {
            feed.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    // Also listen for normal scroll to potentially re-engage
    window.addEventListener('scroll', checkReenter, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', checkReenter);
      cancelAnimationFrame(rafId);
      releaseLock();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: completed ? '100vh' : '100dvh' }}
    >
      {/* Sticky full-screen viewport */}
      <div
        ref={viewportRef}
        className="relative w-full overflow-hidden"
        style={{
          height: '100dvh',
          touchAction: 'none',
          background: 'linear-gradient(180deg, #E0F7FA 0%, #F0F9FF 35%, #F8FAFC 100%)',
        }}
      >
        {/* ── Daytime sky background ──────────────────────── */}
        {/* Dot matrix subtle pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.25,
            backgroundImage: 'radial-gradient(circle at 1px 1px, #0F766E 0.8px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Sun */}
        <div className="absolute pointer-events-none" style={{ right: '12%', top: '8%' }}>
          <div
            className="rounded-full"
            style={{
              width: 120,
              height: 120,
              background: 'radial-gradient(circle, #FEF08A 30%, #FDE047 70%, transparent 100%)',
              boxShadow: '0 0 100px 40px rgba(253,224,71,0.35)',
            }}
          />
        </div>

        {/* Soft clouds */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: '8%', top: '18%',
            width: 200, height: 40,
            background: 'rgba(255,255,255,0.7)',
            filter: 'blur(2px)',
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: '58%', top: '12%',
            width: 240, height: 48,
            background: 'rgba(255,255,255,0.6)',
            filter: 'blur(3px)',
          }}
        />

        {/* ── Intro headline (z-30, above everything) ───── */}
        <div
          ref={introRef}
          className="absolute inset-x-0 flex flex-col items-center text-center px-6 pointer-events-none"
          style={{ top: '10%', zIndex: 30 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase' as const,
              color: '#0F766E',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(16,185,129,0.15)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <span
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#0F766E',
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span>evalipie.in &middot; Flagship Storefront</span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(32px, 6.5vw, 80px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: '#0F172A',
              margin: 0,
            }}
          >
            Every Shop.<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              One Intelligent Marketplace.
            </span>
          </h1>
          <p
            style={{
              marginTop: 14,
              fontSize: 'clamp(13px, 1.6vw, 16px)',
              fontWeight: 600,
              color: '#64748B',
              maxWidth: 480,
            }}
          >
            Discover real local inventories, verified shopkeepers, and AI product matching.
          </p>
        </div>

        {/* ── The 3D World Container (facade + doors) ──── */}
        <div
          ref={worldRef}
          className="absolute inset-0 will-change-transform"
          style={{
            transformOrigin: '50% 62%', // focal point = door center area
          }}
        >
          {/* ── Sidewalk floor ─────────────────────────── */}
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{
              height: '8vh',
              background: 'linear-gradient(180deg, #E2E8F0, #CBD5E1)',
              borderTop: '3px solid rgba(255,255,255,0.8)',
            }}
          />

          {/* ── Shop Façade ────────────────────────────── */}
          <div
            className="absolute"
            style={{
              left: '50%',
              bottom: '8vh',
              transform: 'translateX(-50%)',
              width: 'min(88vw, 780px)',
              height: 'min(54vh, 500px)',
              background: 'linear-gradient(180deg, #115E59, #0F766E 50%, #042F2E)',
              borderRadius: '24px 24px 0 0',
              boxShadow: '0 30px 70px rgba(15,118,110,0.25), 0 0 0 3px rgba(19,78,74,0.3)',
            }}
          >
            {/* Brick texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: '24px 24px 0 0',
                opacity: 0.1,
                background: 'repeating-linear-gradient(0deg, #fff 0 1.5px, transparent 1.5px 36px)',
              }}
            />

            {/* Shop Signboard */}
            <div
              className="absolute flex items-center gap-2.5"
              style={{
                top: 18,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                color: '#0F766E',
                fontWeight: 900,
                fontSize: 'clamp(12px, 1.6vw, 18px)',
                padding: '8px 20px',
                borderRadius: 16,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                border: '1px solid rgba(241,245,249,0.8)',
                zIndex: 25,
                whiteSpace: 'nowrap' as const,
              }}
            >
              <span
                style={{
                  width: 24, height: 24, borderRadius: 8,
                  background: '#0F766E', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}
              >
                e
              </span>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0F172A' }}>
                Evalipie Store
              </span>
              <span
                style={{
                  fontSize: 10, fontWeight: 700, color: '#0F766E',
                  background: '#ECFDF5', padding: '2px 8px', borderRadius: 20,
                }}
              >
                Bengaluru
              </span>
            </div>

            {/* Left showcase window */}
            <div
              className="absolute flex flex-col items-center justify-center"
              style={{
                left: '4%', bottom: '12%',
                width: '20%', height: '34%',
                background: 'linear-gradient(135deg, rgba(224,242,254,0.9), rgba(255,255,255,0.95))',
                border: '3px solid #134E4A',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(15,118,110,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 6,
                }}
              >
                <Headphones className="w-5 h-5 text-[#0F766E]" />
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1E293B' }}>
                Electronics
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, color: '#94A3B8', marginTop: 2 }}>
                Sharma Digital
              </span>
            </div>

            {/* Right showcase window */}
            <div
              className="absolute flex flex-col items-center justify-center"
              style={{
                right: '4%', bottom: '12%',
                width: '20%', height: '34%',
                background: 'linear-gradient(135deg, rgba(224,242,254,0.9), rgba(255,255,255,0.95))',
                border: '3px solid #134E4A',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(15,118,110,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 6,
                }}
              >
                <Store className="w-5 h-5 text-[#0F766E]" />
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1E293B' }}>
                Retail Chain
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, color: '#94A3B8', marginTop: 2 }}>
                City Supermarket
              </span>
            </div>

            {/* ── Door Frame (3D perspective stage) ──── */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: '50%',
                bottom: 0,
                transform: 'translateX(-50%)',
                height: '78%',
                aspectRatio: '0.62',
                background: '#022c22',
                border: '6px solid #134E4A',
                borderBottom: 'none',
                borderRadius: '20px 20px 0 0',
                perspective: '1200px',
                zIndex: 20,
              }}
            >
              {/* Striped awning */}
              <div
                className="absolute"
                style={{
                  left: '-12%', right: '-12%', top: -24, height: 24,
                  borderRadius: '8px 8px 0 0',
                  background: 'repeating-linear-gradient(90deg, #fff 0 20px, #0F766E 20px 40px)',
                  boxShadow: '0 4px 0 #134E4A',
                  zIndex: 20,
                }}
              />

              {/* Interior (behind doors, visible as they open) */}
              <div
                ref={interiorRef}
                className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
                style={{
                  background: 'linear-gradient(180deg, #F0FDFA, white 60%, #F8FAFC)',
                  opacity: 0,
                }}
              >
                <div
                  className="absolute flex justify-between items-center"
                  style={{
                    top: 0, left: 0, right: 0,
                    padding: '10px 14px',
                    background: 'white',
                    borderBottom: '1px solid #F1F5F9',
                    fontSize: 11, fontWeight: 700, color: '#0F766E',
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Merchants</span>
                  </span>
                  <span style={{ color: '#94A3B8', fontWeight: 600 }}>Live Karnataka Network</span>
                </div>

                <div style={{ marginTop: 16 }}>
                  <h2 style={{ fontSize: 'clamp(16px, 2.2vw, 24px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                    Welcome to Evalipie.
                  </h2>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#0F766E', margin: '4px 0 0' }}>
                    Every shopkeeper. One intelligent platform.
                  </p>
                </div>

                <div
                  className="flex items-center justify-between"
                  style={{
                    width: '100%', maxWidth: 220,
                    marginTop: 14,
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 20,
                    padding: '8px 14px',
                    fontSize: 11, color: '#94A3B8',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <span>Describe what you need...</span>
                  <span
                    style={{
                      background: '#7657E8', color: 'white',
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 12,
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}
                  >
                    <Sparkles className="w-3 h-3" /> AI
                  </span>
                </div>

                <div className="flex gap-2" style={{ marginTop: 14 }}>
                  {[Headphones, Laptop, ShoppingBag, Store].map((Icon, i) => (
                    <div
                      key={i}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#F1F5F9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#475569',
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Left Door ─────────────────────────── */}
              <div
                ref={leftDoorRef}
                className="absolute top-0 bottom-0 left-0 will-change-transform"
                style={{
                  width: '50%',
                  background: 'linear-gradient(90deg, #0F766E, #134E4A)',
                  borderRight: '2px solid #042F2E',
                  transformOrigin: 'left center',
                  backfaceVisibility: 'visible',
                  zIndex: 10,
                }}
              >
                {/* Glass panel */}
                <div
                  className="absolute overflow-hidden"
                  style={{
                    left: '14%', right: '14%', top: '10%', bottom: '40%',
                    background: 'linear-gradient(135deg, rgba(224,242,254,0.8), rgba(255,255,255,0.7), rgba(186,230,253,0.8))',
                    borderRadius: 12,
                    border: '3px solid #042F2E',
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(45deg, transparent 44%, rgba(255,255,255,0.65) 50%, transparent 56%)' }}
                  />
                </div>
                {/* Handle */}
                <div
                  className="absolute"
                  style={{
                    right: 8, top: '50%', transform: 'translateY(-50%)',
                    width: 8, height: '20%', borderRadius: 6,
                    background: 'linear-gradient(90deg, #FDE047, #FACC15, #CA8A04)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                />
              </div>

              {/* ── Right Door ────────────────────────── */}
              <div
                ref={rightDoorRef}
                className="absolute top-0 bottom-0 right-0 will-change-transform"
                style={{
                  width: '50%',
                  background: 'linear-gradient(270deg, #0F766E, #134E4A)',
                  borderLeft: '2px solid #042F2E',
                  transformOrigin: 'right center',
                  backfaceVisibility: 'visible',
                  zIndex: 10,
                }}
              >
                {/* Glass panel */}
                <div
                  className="absolute overflow-hidden"
                  style={{
                    left: '14%', right: '14%', top: '10%', bottom: '40%',
                    background: 'linear-gradient(135deg, rgba(224,242,254,0.8), rgba(255,255,255,0.7), rgba(186,230,253,0.8))',
                    borderRadius: 12,
                    border: '3px solid #042F2E',
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(45deg, transparent 44%, rgba(255,255,255,0.65) 50%, transparent 56%)' }}
                  />
                </div>
                {/* Handle */}
                <div
                  className="absolute"
                  style={{
                    left: 8, top: '50%', transform: 'translateY(-50%)',
                    width: 8, height: '20%', borderRadius: 6,
                    background: 'linear-gradient(90deg, #CA8A04, #FACC15, #FDE047)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── White crossfade overlay (masks transition to content) ── */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: '#F8FAFC',
            opacity: 0,
            zIndex: 40,
          }}
        />

        {/* ── Scroll hint CTA ────────────────────────────── */}
        <div
          ref={hintRef}
          className="absolute flex flex-col items-center gap-2 pointer-events-none"
          style={{
            left: '50%', bottom: 'clamp(20px, 6vh, 48px)',
            transform: 'translateX(-50%)',
            zIndex: 35,
            transition: 'opacity 0.4s ease',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase' as const,
              color: 'rgba(15,23,42,0.5)',
            }}
          >
            SCROLL TO ENTER
          </span>
          <svg
            width="14" height="18" viewBox="0 0 14 18"
            style={{ animation: 'evalipie-bounce 1.6s ease-in-out infinite' }}
          >
            <style>{`
              @keyframes evalipie-bounce {
                0%, 100% { transform: translateY(0); opacity: 0.4; }
                50% { transform: translateY(5px); opacity: 1; }
              }
            `}</style>
            <path
              d="M7 1 L7 17 M2 12 L7 17 L12 12"
              stroke="rgba(15,23,42,0.4)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ── Progress bar ────────────────────────────────── */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{ height: 2, background: 'rgba(0,0,0,0.06)', zIndex: 50 }}
        >
          <div
            ref={progressBarRef}
            style={{
              height: '100%', width: '100%',
              background: 'linear-gradient(90deg, #0F766E, #14B8A6)',
              transform: 'scaleX(0)',
              transformOrigin: 'left center',
            }}
          />
        </div>
      </div>
    </section>
  );
};
