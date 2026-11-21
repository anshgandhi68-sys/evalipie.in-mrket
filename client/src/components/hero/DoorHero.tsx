import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';

export const DoorHero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const [doorProgress, setDoorProgress] = useState(0);

  useEffect(() => {
    let animationFrameId: number = 0;

    const handleScroll = () => {
      if (!heroRef.current || !leftDoorRef.current || !rightDoorRef.current) return;
      const hero = heroRef.current;
      const total = hero.offsetHeight - window.innerHeight;
      if (total <= 0) return;

      const top = hero.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, -top / total));
      setDoorProgress(p);

      // Ease function
      const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      const doorAngle = ease(Math.min(1, Math.max(0, p / 0.35))) * 110;

      leftDoorRef.current.style.transform = `rotateY(${doorAngle}deg)`;
      rightDoorRef.current.style.transform = `rotateY(${-doorAngle}deg)`;

      if (worldRef.current && frameRef.current) {
        const zoomProgress = ease(Math.min(1, Math.max(0, (p - 0.28) / 0.65)));
        const scale = 1 + zoomProgress * 3.2;
        worldRef.current.style.transform = `scale(${scale})`;
      }

      if (introRef.current) {
        introRef.current.style.opacity = `${Math.max(0, 1 - p * 3.5)}`;
        introRef.current.style.transform = `translateY(-${p * 80}px)`;
      }

      if (hintRef.current) {
        hintRef.current.style.opacity = `${Math.max(0, 1 - p * 8)}`;
      }

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const scrollToMarketplace = () => {
    const el = document.getElementById('marketplace-feed');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={heroRef} className="relative h-[280vh] w-full bg-[#F7F9FC]">
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-gradient-to-b from-[#BFE6F7] via-[#E3F4FA] to-[#F7F9FC]">
        {/* Sky, Sun & Clouds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-[12%] top-[14%] w-24 h-24 rounded-full bg-gradient-to-br from-[#FFF4C2] to-[#FFE08A] shadow-[0_0_90px_30px_rgba(255,224,138,0.55)]" />
          <div className="absolute left-[8%] top-[22%] w-32 h-8 rounded-full bg-white/80 blur-[0.5px]" />
          <div className="absolute left-[58%] top-[12%] w-28 h-7 rounded-full bg-white/70 blur-[0.5px]" />
          <div className="absolute left-[30%] top-[34%] w-24 h-6 rounded-full bg-white/60 blur-[0.5px]" />
        </div>

        {/* Intro Headline */}
        <div ref={introRef} className="absolute top-[16vh] inset-x-0 text-center px-4 z-10 transition-transform">
          <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#105B55] bg-white/80 px-3 py-1 rounded-full mb-3 shadow-sm border border-white/60">
            evalipie.in
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.05]">
            Every Shop.<br />
            <span className="text-[#167D73]">One Intelligent Marketplace.</span>
          </h1>
        </div>

        {/* The 3D World Container */}
        <div ref={worldRef} className="absolute inset-0 origin-center transition-transform will-change-transform">
          {/* Shop Façade Wall */}
          <div className="absolute left-1/2 bottom-[8vh] -translate-x-1/2 w-[min(94vw,860px)] h-[min(60vh,600px)] bg-gradient-to-b from-[#1b9285] to-[#167D73] rounded-t-[24px] shadow-[0_30px_60px_rgba(16,91,85,0.25)] border-t-4 border-[#105B55]">
            {/* Wall Brick Lines */}
            <div className="absolute inset-0 rounded-t-[24px] opacity-10 bg-[repeating-linear-gradient(0deg,#fff_0_2px,transparent_2px_36px)] pointer-events-none" />

            {/* Shop Sign */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white text-[#105B55] font-extrabold text-base sm:text-xl tracking-tight px-6 py-1.5 rounded-xl shadow-md border border-gray-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#167D73] text-white flex items-center justify-center text-xs">e</span>
              <span>Evalipie Store</span>
            </div>

            {/* Side Windows */}
            <div className="absolute bottom-[10%] left-[6%] w-[20%] h-[34%] bg-gradient-to-br from-[#D9F1F8] to-white border-4 border-[#105B55] rounded-xl flex flex-col items-center justify-center shadow-inner">
              <span className="text-3xl">🎧</span>
              <small className="text-[10px] font-bold text-[#105B55] tracking-wider mt-1 uppercase">Electronics</small>
            </div>
            <div className="absolute bottom-[10%] right-[6%] w-[20%] h-[34%] bg-gradient-to-br from-[#D9F1F8] to-white border-4 border-[#105B55] rounded-xl flex flex-col items-center justify-center shadow-inner">
              <span className="text-3xl">🏠</span>
              <small className="text-[10px] font-bold text-[#105B55] tracking-wider mt-1 uppercase">Home</small>
            </div>

            {/* Door Frame with 3D Perspective */}
            <div
              ref={frameRef}
              className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[78%] aspect-[0.64] bg-[#0c3d39] border-8 border-[#105B55] border-b-0 rounded-t-2xl [perspective:1100px] overflow-hidden shadow-2xl"
            >
              {/* Awning Strip on top */}
              <div className="absolute -left-[15%] -right-[15%] -top-7 h-7 rounded-t-lg bg-[repeating-linear-gradient(90deg,#fff_0_20px,#E9F7F3_20px_40px)] shadow-[0_5px_0_#105B55] z-20" />

              {/* Inside Store Reveal (Visible as doors open) */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#E9F7F3] via-white to-[#F7F9FC] flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute top-0 inset-x-0 flex justify-between p-3.5 bg-white border-b border-gray-200 text-xs font-bold text-[#105B55]">
                  <span>Evalipie</span>
                  <span className="text-gray-500 font-medium">Bengaluru ▾</span>
                </div>
                <h2 className="text-xl font-extrabold text-[#111827] mb-1">Find exactly what you need.</h2>
                <p className="text-xs text-[#167D73] font-bold mb-3">From every local shop.</p>
                <div className="w-full bg-white border border-gray-200 rounded-full py-2 px-3 flex justify-between items-center text-xs text-gray-400 shadow-sm">
                  <span>Describe what you need…</span>
                  <span className="bg-[#7657E8] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI
                  </span>
                </div>
                <div className="flex gap-2 mt-4 text-xl">
                  <span>🎧</span><span>🎙️</span><span>⌨️</span><span>🍳</span>
                </div>
              </div>

              {/* 3D Left Door */}
              <div
                ref={leftDoorRef}
                className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-[#105B55] to-[#1a8479] border-r-2 border-[#0c3d39] origin-left transition-transform will-change-transform z-10 [backface-visibility:visible]"
              >
                {/* Door Glass Inset */}
                <div className="absolute inset-x-[14%] top-[10%] bottom-[42%] bg-gradient-to-br from-[#D9F1F8] via-white to-[#BFE6F7] rounded-md border-4 border-[#0c3d39]" />
                {/* Gold Door Handle */}
                <div className="absolute right-2 top-[56%] w-2.5 h-[20%] rounded-full bg-[#F3D27A] shadow-[0_2px_6px_rgba(0,0,0,0.3)]" />
              </div>

              {/* 3D Right Door */}
              <div
                ref={rightDoorRef}
                className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-[#105B55] to-[#1a8479] border-l-2 border-[#0c3d39] origin-right transition-transform will-change-transform z-10 [backface-visibility:visible]"
              >
                {/* Door Glass Inset */}
                <div className="absolute inset-x-[14%] top-[10%] bottom-[42%] bg-gradient-to-br from-[#D9F1F8] via-white to-[#BFE6F7] rounded-md border-4 border-[#0c3d39]" />
                {/* Gold Door Handle */}
                <div className="absolute left-2 top-[56%] w-2.5 h-[20%] rounded-full bg-[#F3D27A] shadow-[0_2px_6px_rgba(0,0,0,0.3)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Ground Floor */}
        <div className="absolute left-0 right-0 bottom-0 h-[8vh] bg-gradient-to-b from-[#D8DEE6] to-[#C7CFDA] border-t-4 border-white pointer-events-none" />

        {/* Scroll Instruction Hint / Shortcut Button */}
        <div ref={hintRef} className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <button
            onClick={scrollToMarketplace}
            className="bg-[#111827] text-white text-xs font-bold tracking-wider uppercase px-5 py-2.5 rounded-full shadow-lg hover:bg-black transition-all flex items-center gap-2 animate-bounce"
          >
            <span>Scroll or Click to Enter Marketplace</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 z-30">
          <div ref={barRef} className="h-full bg-[#167D73] origin-left transition-transform scale-x-0" />
        </div>
      </div>
    </section>
  );
};
