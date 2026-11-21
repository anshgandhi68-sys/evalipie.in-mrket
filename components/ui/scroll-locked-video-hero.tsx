"use client"

import React, { useEffect, useRef, useState } from "react"

export interface MetroHeroProps {
  videoSrc?: string
  title?: string
  scrollHint?: string
  tagline?: string
  signature?: { name: string; url: string } | false
  scrubDistance?: number
  className?: string
  style?: React.CSSProperties
  autoUnlock?: boolean
  onComplete?: () => void
  showSkipButton?: boolean
}

const DEFAULT_VIDEO = "/assets/metro-hero.mp4"
const DEFAULT_SIGNATURE = { name: "Evalipie Marketplace", url: "https://evalipie.in" }
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

const COL_BG = "#05070d"
const COL_TEXT = "#f2f4f8"

export default function MetroHero({
  videoSrc = DEFAULT_VIDEO,
  title = "Welcome to Evalipie",
  scrollHint = "SCROLL TO ENTER",
  tagline = "Every door in the city is already open.",
  signature = DEFAULT_SIGNATURE,
  className,
  style,
  onComplete,
  showSkipButton = true,
}: MetroHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Autoplay video smoothly on mount
    video.currentTime = 0
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setReady(true)
          setIsPlaying(true)
        })
        .catch(() => {
          // Fallback if autoplay policy needs user interaction
          setReady(true)
        })
    }

    const onTimeUpdate = () => {
      if (!video || !video.duration) return
      const progress = video.currentTime / video.duration

      // Title fades out as doors open (0.0 to 0.45)
      if (titleRef.current) {
        const titleOpacity = Math.max(0, 1 - progress * 2.2)
        const titleScale = 1 + progress * 0.15
        titleRef.current.style.opacity = String(titleOpacity)
        titleRef.current.style.transform = `scale(${titleScale})`
      }

      // Tagline reveals as doors swing fully open (0.4 to 0.85)
      if (taglineRef.current) {
        let tagOpacity = 0
        if (progress > 0.35) {
          tagOpacity = Math.min(1, (progress - 0.35) * 2.5)
        }
        taglineRef.current.style.opacity = String(tagOpacity)
      }

      // Progress line
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${Math.min(100, progress * 100)}%`
      }
    }

    const onEnded = () => {
      onComplete?.()
    }

    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("ended", onEnded)

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("ended", onEnded)
    }
  }, [onComplete])

  const scrollToMarketplace = () => {
    onComplete?.()
    const feed = document.getElementById("marketplace-feed")
    if (feed) {
      feed.scrollIntoView({ behavior: "smooth" })
    } else if (sectionRef.current) {
      window.scrollTo({ top: sectionRef.current.offsetHeight, behavior: "smooth" })
    }
  }

  return (
    <div
      ref={sectionRef}
      className={className}
      style={{
        position: "relative",
        height: "clamp(550px, 85vh, 850px)",
        width: "100%",
        overflow: "hidden",
        background: COL_BG,
        ...style,
      }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        autoPlay
        preload="auto"
        loop
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: ready ? 1 : 0,
          transformOrigin: "center center",
          transition: "opacity 0.6s ease",
          pointerEvents: "none",
        }}
      />

      {/* Atmospheric Vignette Gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(5,7,13,0.45) 0%, rgba(5,7,13,0.1) 40%, rgba(5,7,13,0.2) 70%, rgba(5,7,13,0.65) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Left Brand Pill */}
      <div
        style={{
          position: "absolute",
          top: "clamp(16px, 3vh, 32px)",
          left: "clamp(16px, 3vw, 32px)",
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(18, 11, 46, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.18)",
          padding: "6px 14px",
          borderRadius: "9999px",
        }}
      >
        <img src="/assets/evalipie-favicon.png" alt="Evalipie" style={{ height: "18px", width: "18px", borderRadius: "4px" }} />
        <span style={{ color: "#E6E9E4", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: SANS }}>
          Evalipie
        </span>
      </div>

      {/* Top Right Skip / Enter marketplace button */}
      {showSkipButton && (
        <button
          onClick={scrollToMarketplace}
          type="button"
          style={{
            position: "absolute",
            top: "clamp(16px, 3vh, 32px)",
            right: "clamp(16px, 3vw, 32px)",
            zIndex: 30,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#ffffff",
            padding: "8px 18px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.28)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)"
          }}
        >
          Explore Marketplace ↓
        </button>
      )}

      {/* Center Title ("Welcome to Evalipie") */}
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
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: "clamp(32px, 6.5vw, 92px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: COL_TEXT,
            textShadow: "0 4px 30px rgba(0,0,0,0.6)",
            display: "inline-block",
          }}
        >
          {title}
        </span>
      </div>

      {/* Tagline ("Every door in the city is already open.") */}
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
            transition: "opacity 0.4s ease",
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: "clamp(20px, 3.2vw, 42px)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: COL_TEXT,
              textShadow: "0 2px 20px rgba(0,0,0,0.6)",
              display: "inline-block",
            }}
          >
            {tagline}
          </span>
        </div>
      )}

      {/* Bottom Scroll Indicator */}
      <div
        ref={hintRef}
        onClick={scrollToMarketplace}
        style={{
          position: "absolute",
          left: "50%",
          bottom: "clamp(20px, 5vh, 40px)",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: "rgba(240,244,248,0.8)",
          fontFamily: SANS,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.25em",
          cursor: "pointer",
          zIndex: 30,
        }}
      >
        <span>{scrollHint}</span>
        <svg width="14" height="18" viewBox="0 0 14 18" style={{ animation: "metro-hero-bounce 1.5s ease-in-out infinite" }}>
          <style>{`
            @keyframes metro-hero-bounce {
              0%, 100% { transform: translateY(0); opacity: 0.5; }
              50% { transform: translateY(5px); opacity: 1; }
            }
          `}</style>
          <path d="M7 1 L7 17 M2 12 L7 17 L12 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Thin Progress Bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 2,
          background: "rgba(255,255,255,0.12)",
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            height: "100%",
            width: "0%",
            background: "#167D73",
            transition: "width 0.2s linear",
          }}
        />
      </div>
    </div>
  )
}
