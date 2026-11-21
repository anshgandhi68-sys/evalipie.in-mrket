import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowDown, Sparkles, Headphones, Store, ShoppingBag, Laptop, ShieldCheck } from 'lucide-react';

export const DoorHero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const interiorRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const isAutoEntering = useRef(false);

  // Smooth scroll down to marketplace
  const enterMarketplace = useCallback(() => {
    if (isAutoEntering.current) return;
    isAutoEntering.current = true;
    setHasEntered(true);

    const el = document.getElementById('marketplace-feed');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      isAutoEntering.current = false;
    }, 1000);
  }, []);

  useEffect(() => {
    let rafId: number = 0;

    const handleScroll = () => {
      if (!heroRef.current) return;
      const hero = heroRef.current;
      const total = hero.offsetHeight - window.innerHeight;
      if (total <= 0) return;

      const rect = hero.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setProgress(p);

      // Smooth easing function
      const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

      // 1. Doors swing open from p: 0.0 to 0.40
      const doorFactor = Math.min(1, Math.max(0, p / 0.40));
      const doorAngle = ease(doorFactor) * 115;

      if (leftDoorRef.current) {
        leftDoorRef.current.style.transform = `rotateY(${doorAngle}deg)`;
      }
      if (rightDoorRef.current) {
        rightDoorRef.current.style.transform = `rotateY(${-doorAngle}deg)`;
      }

      // 2. Camera zoom / dolly forward from p: 0.22 to 0.85
      if (worldRef.current) {
        const zoomFactor = Math.min(1, Math.max(0, (p - 0.22) / 0.65));
        const scale = 1 + ease(zoomFactor) * 3.6;
        const translateY = ease(zoomFactor) * 12; // slight upward camera tilt into entrance
        worldRef.current.style.transform = `scale(${scale}) translateY(${translateY}%)`;
      }

      // 3. Intro Title fades out rapidly
      if (introRef.current) {
        introRef.current.style.opacity = `${Math.max(0, 1 - p * 3.2)}`;
        introRef.current.style.transform = `translateY(-${p * 90}px)`;
      }

      // 4. Store Interior Lighting fades in as doors open
      if (interiorRef.current) {
        const interiorOpacity = Math.min(1, Math.max(0, (p - 0.15) / 0.4));
        interiorRef.current.style.opacity = `${0.6 + interiorOpacity * 0.4}`;
      }

      // 5. Scroll Hint button fades out as doors open
      if (hintRef.current) {
        hintRef.current.style.opacity = `${Math.max(0, 1 - p * 5)}`;
      }

      // 6. Scrub progress indicator bar
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }

      // 7. Automatic entry trigger when doors are fully open and user scrolls through
      if (p >= 0.85 && !hasEntered && !isAutoEntering.current) {
        enterMarketplace();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [enterMarketplace, hasEntered]);

  return (
    <section ref={heroRef} className="relative h-[250vh] w-full bg-[#F8FAFC]">
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-gradient-to-b from-[#E0F2FE]/70 via-[#F0F9FF]/80 to-[#F8FAFC]">
        {/* Architectural Blueprint / Tech Dot Matrix Background Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0F766E 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />

        {/* Daytime Atmospheric Sun & Sky Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Radiant Morning Sun */}
          <div className="absolute right-[14%] top-[10%] w-36 h-36 rounded-full bg-gradient-to-br from-[#FEF08A] to-[#FDE047] blur-[1px] shadow-[0_0_120px_50px_rgba(253,224,71,0.45)] opacity-90" />
          {/* Subtle daylight ambient lens rings */}
          <div className="absolute right-[10%] top-[8%] w-64 h-64 rounded-full border border-amber-200/30 blur-[2px]" />
          <div className="absolute left-[12%] top-[24%] w-48 h-10 rounded-full bg-white/70 blur-[1px]" />
          <div className="absolute left-[64%] top-[18%] w-56 h-12 rounded-full bg-white/60 blur-[1px]" />
        </div>

        {/* Intro Headline */}
        <div ref={introRef} className="absolute top-[14vh] inset-x-0 text-center px-4 z-20 transition-transform">
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] uppercase text-[#0F766E] bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full mb-3 shadow-sm border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />
            <span>evalipie.in · Flagship Storefront</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#0F172A] leading-[1.05]">
            Every Shop.<br />
            <span className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] bg-clip-text text-transparent">
              One Intelligent Marketplace.
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-500 font-semibold max-w-xl mx-auto">
            Discover real local inventories, verified shopkeepers, and AI product matching.
          </p>
        </div>

        {/* The 3D World Container */}
        <div ref={worldRef} className="absolute inset-0 origin-center transition-transform will-change-transform">
          {/* Shop Façade Wall */}
          <div className="absolute left-1/2 bottom-[6vh] -translate-x-1/2 w-[min(94vw,900px)] h-[min(62vh,620px)] bg-gradient-to-b from-[#115E59] via-[#0F766E] to-[#042F2E] rounded-t-[28px] shadow-[0_35px_80px_rgba(15,118,110,0.3)] border-t-4 border-[#134E4A]">
            {/* Architectural Stone Brick Lines */}
            <div className="absolute inset-0 rounded-t-[28px] opacity-15 bg-[repeating-linear-gradient(0deg,#fff_0_2px,transparent_2px_40px)] pointer-events-none" />

            {/* Premium Shop Signboard */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white text-[#0F766E] font-black text-sm sm:text-lg tracking-tight px-7 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2.5 z-30">
              <span className="w-6 h-6 rounded-lg bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                e
              </span>
              <span className="uppercase tracking-wider font-extrabold text-slate-900">Evalipie Store</span>
              <span className="text-[10px] font-bold text-[#0F766E] bg-emerald-50 px-2 py-0.5 rounded-full ml-1">
                Bengaluru
              </span>
            </div>

            {/* Left Showcase Window (Electronics & Audio - Clean Lucide Icon, Zero Emoji) */}
            <div className="absolute bottom-[10%] left-[5%] w-[21%] h-[36%] bg-gradient-to-br from-[#E0F2FE]/90 to-white/95 border-4 border-[#134E4A] rounded-2xl flex flex-col items-center justify-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent pointer-events-none" />
              <div className="w-12 h-12 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] mb-2 shadow-sm">
                <Headphones className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold text-slate-800 tracking-wider uppercase">Electronics</span>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5">Sharma Digital</span>
            </div>

            {/* Right Showcase Window (Home & Lifestyle - Clean Lucide Icon, Zero Emoji) */}
            <div className="absolute bottom-[10%] right-[5%] w-[21%] h-[36%] bg-gradient-to-br from-[#E0F2FE]/90 to-white/95 border-4 border-[#134E4A] rounded-2xl flex flex-col items-center justify-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent pointer-events-none" />
              <div className="w-12 h-12 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] mb-2 shadow-sm">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold text-slate-800 tracking-wider uppercase">Retail Chain</span>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5">City Supermarket</span>
            </div>

            {/* Door Frame with 3D Perspective Stage */}
            <div
              ref={frameRef}
              className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[80%] aspect-[0.66] bg-[#022c22] border-8 border-[#134E4A] border-b-0 rounded-t-3xl [perspective:1200px] overflow-hidden shadow-2xl z-20"
            >
              {/* Awning Strip on top */}
              <div className="absolute -left-[15%] -right-[15%] -top-7 h-7 rounded-t-lg bg-[repeating-linear-gradient(90deg,#fff_0_24px,#0F766E_24px_48px)] shadow-[0_5px_0_#134E4A] z-20" />

              {/* Inside Store Reveal (Visible as doors open) */}
              <div
                ref={interiorRef}
                className="absolute inset-0 bg-gradient-to-b from-[#F0FDFA] via-white to-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center transition-opacity"
              >
                <div className="absolute top-0 inset-x-0 flex justify-between items-center p-3.5 bg-white border-b border-slate-100 text-xs font-bold text-[#0F766E]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Merchants</span>
                  </span>
                  <span className="text-slate-500 font-semibold">Live Karnataka Network</span>
                </div>

                <div className="space-y-1.5 mt-4">
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Welcome to Evalipie.</h2>
                  <p className="text-xs text-[#0F766E] font-bold">Every shopkeeper. One intelligent platform.</p>
                </div>

                <div className="w-full max-w-xs mt-4 bg-white border border-slate-200 rounded-full py-2.5 px-4 flex justify-between items-center text-xs text-slate-400 shadow-sm">
                  <span>Describe what you need…</span>
                  <span className="bg-[#7657E8] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI
                  </span>
                </div>

                {/* Clean Lucide Icon Pill Badges */}
                <div className="flex gap-2.5 mt-5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs">
                    <Store className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 3D Left Door */}
              <div
                ref={leftDoorRef}
                className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-[#0F766E] to-[#134E4A] border-r-2 border-[#042F2E] origin-left transition-transform will-change-transform z-10 [backface-visibility:visible]"
              >
                {/* Modern Architectural Glass Inset */}
                <div className="absolute inset-x-[12%] top-[10%] bottom-[38%] bg-gradient-to-br from-[#E0F2FE]/80 via-white/70 to-[#BAE6FD]/80 rounded-xl border-4 border-[#042F2E] shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.7)_50%,transparent_55%)] pointer-events-none" />
                </div>
                {/* Brushed Brass Vertical Handle */}
                <div className="absolute right-2.5 top-[52%] w-2.5 h-[22%] rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#CA8A04] shadow-[0_2px_8px_rgba(0,0,0,0.35)]" />
              </div>

              {/* 3D Right Door */}
              <div
                ref={rightDoorRef}
                className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-[#0F766E] to-[#134E4A] border-l-2 border-[#042F2E] origin-right transition-transform will-change-transform z-10 [backface-visibility:visible]"
              >
                {/* Modern Architectural Glass Inset */}
                <div className="absolute inset-x-[12%] top-[10%] bottom-[38%] bg-gradient-to-br from-[#E0F2FE]/80 via-white/70 to-[#BAE6FD]/80 rounded-xl border-4 border-[#042F2E] shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.7)_50%,transparent_55%)] pointer-events-none" />
                </div>
                {/* Brushed Brass Vertical Handle */}
                <div className="absolute left-2.5 top-[52%] w-2.5 h-[22%] rounded-full bg-gradient-to-r from-[#CA8A04] via-[#FACC15] to-[#FDE047] shadow-[0_2px_8px_rgba(0,0,0,0.35)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Polished Sidewalk / Platform Floor */}
        <div className="absolute left-0 right-0 bottom-0 h-[6vh] bg-gradient-to-b from-[#E2E8F0] to-[#CBD5E1] border-t-4 border-white pointer-events-none" />

        {/* Floating Action CTA to trigger Door Opening and Enter Marketplace */}
        <div ref={hintRef} className="absolute bottom-[9vh] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          <button
            onClick={enterMarketplace}
            className="group bg-[#0F172A] hover:bg-black text-white text-xs font-extrabold tracking-wider uppercase px-6 py-3 rounded-full shadow-2xl transition-all flex items-center gap-2.5 border border-slate-700 active:scale-95 animate-bounce"
          >
            <span>Scroll or Click to Open & Enter</span>
            <ArrowDown className="w-4 h-4 text-[#14B8A6] group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Progress Bar at the base */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/5 z-30">
          <div ref={barRef} className="h-full bg-[#0F766E] origin-left transition-transform scale-x-0" />
        </div>
      </div>
    </section>
  );
};
