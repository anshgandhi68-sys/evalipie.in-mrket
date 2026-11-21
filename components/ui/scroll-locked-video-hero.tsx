"use client"

import React, { useEffect, useRef, useState } from "react"

export interface MetroHeroProps {
  videoSrc?: string
  title?: string
  scrollHint?: string
  tagline?: string
  signature?: { name: string; url: string } | false
  className?: string
  style?: React.CSSProperties
  onComplete?: () => void
  showSkipButton?: boolean
}

const DEFAULT_VIDEO = "/assets/metro-hero.mp4"
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

export default function MetroHero({
  videoSrc = DEFAULT_VIDEO,
  title = "Welcome to Evalipie",
  scrollHint = "SCROLL TO ENTER",
  tagline = "Every door in the city is already open.",
  className,
  style,
  onComplete,
  showSkipButton = true,
}: MetroHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const sunbeamsRef = useRef<SVGSVGElement>(null)
  const daylightGlowRef = useRef<HTMLDivElement>(null)
  const doorBurstGlowRef = useRef<HTMLDivElement>(null)

  const [ready, setReady] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let duration = 0
    let rafId = 0
    let targetProgress = 0
    let currentProgress = 0
    let isSeeking = false
    let pendingTime: number | null = null

    const onLoadedData = () => {
      duration = video.duration || 0
      setReady(true)
    }

    const onSeeked = () => {
      isSeeking = false
      if (pendingTime !== null && video) {
        const nextTime = pendingTime
        pendingTime = null
        isSeeking = true
        video.currentTime = nextTime
      }
    }

    video.addEventListener("loadeddata", onLoadedData)
    video.addEventListener("seeked", onSeeked)

    // Pre-seek slightly to ensure initial frame is painted
    video.currentTime = 0.05

    // Native Passive Scroll Listener
    const handleScroll = () => {
      const heroTrack = document.getElementById("hero-entry")
      if (!heroTrack) return

      const rect = heroTrack.getBoundingClientRect()
      const scrollableDistance = heroTrack.offsetHeight - window.innerHeight
      if (scrollableDistance <= 0) return

      const scrolled = -rect.top
      const progress = Math.min(1, Math.max(0, scrolled / scrollableDistance))
      targetProgress = progress
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    // 60FPS Smooth Interpolation Engine
    const updateLoop = () => {
      // Smooth lerp easing for silky fluid scrub
      currentProgress += (targetProgress - currentProgress) * 0.14
      setScrollProgress(currentProgress)

      // Video scrub synchronization
      if (duration > 0 && video) {
        const targetTime = Math.min(duration - 0.05, currentProgress * duration)
        if (Math.abs(video.currentTime - targetTime) > 0.035) {
          if (!isSeeking) {
            isSeeking = true
            video.currentTime = targetTime
          } else {
            pendingTime = targetTime
          }
        }
      }

      // 1. Title fade & zoom ("Welcome to Evalipie")
      if (titleRef.current) {
        const titleOpacity = Math.max(0, 1 - currentProgress * 2.4)
        const titleScale = 1 + currentProgress * 0.12
        titleRef.current.style.opacity = String(titleOpacity)
        titleRef.current.style.transform = `scale(${titleScale})`
      }

      // 2. Tagline reveal ("Every door in the city is already open.")
      if (taglineRef.current) {
        let tagOpacity = 0
        if (currentProgress > 0.35) {
          tagOpacity = Math.min(1, (currentProgress - 0.35) * 2.2)
        }
        taglineRef.current.style.opacity = String(tagOpacity)
      }

      // 3. Sunshine Volumetric God-Rays Intensity
      if (sunbeamsRef.current) {
        // Sunbeams stream intensely through the windows, expanding as doors open
        const beamOpacity = Math.min(1, 0.45 + currentProgress * 0.55)
        sunbeamsRef.current.style.opacity = String(beamOpacity)
      }

      // 4. Doorway Morning Sunlight Burst
      if (doorBurstGlowRef.current) {
        // Bright morning sun pours in as doors slide open (progress > 0.3)
        let burstOpacity = 0
        if (currentProgress > 0.28) {
          burstOpacity = Math.min(0.85, (currentProgress - 0.28) * 1.5)
        }
        doorBurstGlowRef.current.style.opacity = String(burstOpacity)
      }

      // 5. Scroll hint fade
      if (hintRef.current) {
        hintRef.current.style.opacity = String(Math.max(0, 1 - currentProgress * 3.5))
      }

      // 6. Progress bar
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${Math.min(100, currentProgress * 100)}%`
      }

      rafId = requestAnimationFrame(updateLoop)
    }

    rafId = requestAnimationFrame(updateLoop)

    return () => {
      video.removeEventListener("loadeddata", onLoadedData)
      video.removeEventListener("seeked", onSeeked)
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const scrollToMarketplace = () => {
    onComplete?.()
    const feed = document.getElementById("marketplace-feed")
    if (feed) {
      feed.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className || ""}`}
      style={{
        background: "#080B12",
        ...style,
      }}
    >
      {/* ── 1. BACKGROUND VIDEO (Daylight Grade & Warm Color Balance) ────── */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: ready ? 1 : 0,
          transformOrigin: "center center",
          transition: "opacity 0.5s ease",
          pointerEvents: "none",
          // DAYTIME GRADING: Transforms cold dark blue night into sunny morning daylight
          filter: "brightness(1.28) contrast(1.12) saturate(1.35) sepia(0.18) hue-rotate(-14deg)",
        }}
      />

      {/* ── 2. DAYLIGHT AMBIENT ATMOSPHERE & MORNING SKY OVERLAY ─────────── */}
      <div
        ref={daylightGlowRef}
        style={{
          position: "absolute",
          inset: 0,
          // Warm sky daylight ambient gradient
          background: "linear-gradient(180deg, rgba(220, 240, 255, 0.22) 0%, rgba(255, 235, 185, 0.18) 35%, rgba(255, 215, 130, 0.12) 65%, rgba(20, 24, 35, 0.45) 100%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {/* ── 3. VOLUMETRIC SUNSHINE GOD-RAYS (Streaming through Windows) ──── */}
      <svg
        ref={sunbeamsRef}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 15,
          opacity: 0.55,
          mixBlendMode: "screen",
          transition: "opacity 0.1s linear",
        }}
      >
        <defs>
          {/* Main Morning Sunbeam from Right Window */}
          <linearGradient id="sunbeam-right-window" x1="85%" y1="5%" x2="40%" y2="95%">
            <stop offset="0%" stopColor="#FFF9E0" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#FFDE82" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#FFBE40" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFA020" stopOpacity="0" />
          </linearGradient>

          {/* Secondary Morning Sunbeam from Left Window */}
          <linearGradient id="sunbeam-left-window" x1="15%" y1="8%" x2="55%" y2="95%">
            <stop offset="0%" stopColor="#FFF7D6" stopOpacity="0.75" />
            <stop offset="30%" stopColor="#FFD870" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#FFB830" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FFA020" stopOpacity="0" />
          </linearGradient>

          {/* Soft Center Window Sheen */}
          <linearGradient id="sunbeam-center" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFEE8" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FFDF85" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFC840" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Right Window Diagonal Sun Shaft 1 */}
        <polygon
          points="1550,60 1780,90 1150,1080 720,1080"
          fill="url(#sunbeam-right-window)"
        />

        {/* Right Window Diagonal Sun Shaft 2 (Broad ambient beam) */}
        <polygon
          points="1420,100 1850,140 1380,1080 950,1080"
          fill="url(#sunbeam-right-window)"
          opacity="0.7"
        />

        {/* Left Window Diagonal Sun Shaft 1 */}
        <polygon
          points="120,80 380,50 1120,1080 780,1080"
          fill="url(#sunbeam-left-window)"
        />

        {/* Left Window Diagonal Sun Shaft 2 */}
        <polygon
          points="60,120 450,100 1280,1080 980,1080"
          fill="url(#sunbeam-left-window)"
          opacity="0.65"
        />
      </svg>

      {/* ── 4. GOLDEN SUN LENS FLARE (Top Right Window Pane) ─────────────── */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          right: "12%",
          width: "clamp(250px, 35vw, 550px)",
          height: "clamp(250px, 35vw, 550px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 255, 230, 0.95) 0%, rgba(255, 220, 120, 0.6) 25%, rgba(255, 175, 50, 0.25) 50%, transparent 75%)",
          mixBlendMode: "screen",
          filter: "blur(20px)",
          pointerEvents: "none",
          zIndex: 16,
        }}
      />

      {/* ── 5. LEFT WINDOW SUN GLARE ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "clamp(200px, 30vw, 450px)",
          height: "clamp(200px, 30vw, 450px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 248, 220, 0.85) 0%, rgba(255, 210, 110, 0.5) 25%, rgba(255, 170, 40, 0.2) 50%, transparent 70%)",
          mixBlendMode: "screen",
          filter: "blur(24px)",
          pointerEvents: "none",
          zIndex: 16,
        }}
      />

      {/* ── 6. MORNING SUNLIGHT BURST WHEN DOORS OPEN ───────────────────── */}
      <div
        ref={doorBurstGlowRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, rgba(255, 252, 235, 0.9) 0%, rgba(255, 225, 145, 0.6) 35%, rgba(255, 185, 80, 0.25) 65%, transparent 85%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
          zIndex: 17,
          opacity: 0,
          transition: "opacity 0.1s linear",
        }}
      />

      {/* ── 7. TOP BRAND PILL (Top Left) ─────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "clamp(16px, 3vh, 32px)",
          left: "clamp(16px, 3vw, 32px)",
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(18, 11, 46, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 225, 150, 0.3)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4), 0 0 15px rgba(255, 215, 120, 0.2)",
          padding: "7px 16px",
          borderRadius: "9999px",
        }}
      >
        <img src="/assets/evalipie-favicon.png" alt="Evalipie" style={{ height: "18px", width: "18px", borderRadius: "4px" }} />
        <span style={{ color: "#FFF8E7", fontSize: "11px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: SANS }}>
          Evalipie
        </span>
        <span style={{ color: "#E9B65B", fontSize: "10px", fontWeight: 700, paddingLeft: 4, borderLeft: "1px solid rgba(255,255,255,0.2)" }}>
          Daylight Edition
        </span>
      </div>

      {/* ── 8. TOP RIGHT SKIP / ENTER MARKETPLACE BUTTON ─────────────────── */}
      {showSkipButton && (
        <button
          onClick={scrollToMarketplace}
          type="button"
          style={{
            position: "absolute",
            top: "clamp(16px, 3vh, 32px)",
            right: "clamp(16px, 3vw, 32px)",
            zIndex: 30,
            background: "rgba(18, 11, 46, 0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 225, 150, 0.35)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
            color: "#FFF8E7",
            padding: "8px 20px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.05em",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(22, 125, 115, 0.95)"
            e.currentTarget.style.borderColor = "#14B8A6"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(18, 11, 46, 0.8)"
            e.currentTarget.style.borderColor = "rgba(255, 225, 150, 0.35)"
          }}
        >
          Explore Marketplace ↓
        </button>
      )}

      {/* ── 9. CENTER TITLE ("Welcome to Evalipie" in Daylight Gold) ─────── */}
      <div
        ref={titleRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 6%",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 25,
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: "clamp(34px, 7vw, 98px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            textShadow: "0 4px 25px rgba(0,0,0,0.85), 0 0 40px rgba(255, 215, 120, 0.45)",
            display: "inline-block",
          }}
        >
          {title}
        </span>
      </div>

      {/* ── 10. TAGLINE ("Every door in the city is already open.") ──────── */}
      {tagline && (
        <div
          ref={taglineRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 8%",
            textAlign: "center",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 25,
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: "clamp(22px, 3.8vw, 48px)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              textShadow: "0 4px 30px rgba(0,0,0,0.9), 0 0 50px rgba(255, 220, 140, 0.6)",
              display: "inline-block",
            }}
          >
            {tagline}
          </span>
        </div>
      )}

      {/* ── 11. BOTTOM SCROLL TO ENTER INDICATOR ─────────────────────────── */}
      <div
        ref={hintRef}
        onClick={scrollToMarketplace}
        style={{
          position: "absolute",
          left: "50%",
          bottom: "clamp(24px, 5vh, 44px)",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: "#FFF8E7",
          fontFamily: SANS,
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.25em",
          cursor: "pointer",
          zIndex: 30,
          textShadow: "0 2px 10px rgba(0,0,0,0.8)",
        }}
      >
        <span>{scrollHint}</span>
        <svg width="15" height="20" viewBox="0 0 14 18" style={{ animation: "metro-sun-bounce 1.5s ease-in-out infinite" }}>
          <style>{`
            @keyframes metro-sun-bounce {
              0%, 100% { transform: translateY(0); opacity: 0.6; }
              50% { transform: translateY(6px); opacity: 1; }
            }
          `}</style>
          <path d="M7 1 L7 17 M2 12 L7 17 L12 12" stroke="#FFDF85" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ── 12. BOTTOM GOLDEN PROGRESS LINE ─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          background: "rgba(255,255,255,0.15)",
          zIndex: 30,
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            height: "100%",
            width: "0%",
            background: "linear-gradient(90deg, #167D73, #F59E0B, #FDE68A)",
            boxShadow: "0 0 10px rgba(245, 158, 11, 0.8)",
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </div>
  )
}
