import { useBirthdayData } from '@/hooks/useBirthdayData';
import ConfettiEffect from './ConfettiEffect';
import FestiveParticles from './FestiveParticles';
import sqbLogo from '@/assets/sqb-logo.png';
import { useState, useEffect } from 'react';

// LED Screen dimensions
const LED_WIDTH = 1536;
const LED_HEIGHT = 3456;

// Development scale (set to 1 for production)
const DEV_SCALE = 0.25;

const BirthdayDisplay = () => {
  const { data, isLoaded } = useBirthdayData();
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeData = Array.isArray(data) ? data : [];

  // Rotation logic for more than 6 names
  useEffect(() => {
    if (safeData.length > 6) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % safeData.length);
      }, 10000); // Change every 10 seconds
      return () => clearInterval(interval);
    }
  }, [safeData.length]);

  // Get the 6 names to display (with wrap-around)
  const visibleData = safeData.length > 6
    ? [...safeData, ...safeData].slice(currentIndex, currentIndex + 6)
    : safeData;

  if (!isLoaded) {
    return (
      <div
        className="bg-gradient-to-b from-[#0a1929] to-[#0d3b66] flex items-center justify-center"
        style={{
          width: LED_WIDTH,
          height: LED_HEIGHT,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
          transform: `scale(${DEV_SCALE})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="text-white/50 text-6xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: LED_WIDTH,
        height: LED_HEIGHT,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
        transform: `scale(${DEV_SCALE})`,
        transformOrigin: 'top left',
      }}
    >
      {/* Aesthetic SQB Light Background */}
      <div className="absolute inset-0 bg-[#f4f7f9] overflow-hidden">
        {/* Dynamic Light Blobs from Logo Colors */}
        <div className="absolute top-[-10%] left-[-20%] w-[100%] h-[60%] bg-[#004666]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[50%] bg-[#e31e24]/5 rounded-full blur-[100px]" />

        {/* Subtle Logo Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-[0.02] pointer-events-none">
          <img src={sqbLogo} alt="" className="w-full h-full object-contain grayscale" />
        </div>
      </div>

      {/* Refined Confetti */}
      <ConfettiEffect />

      {/* Content - High-End Aesthetic */}
      <div className="relative z-20 h-full flex flex-col items-center justify-between py-40 px-16">

        {/* Header - Elegant Logo Integration */}
        <div className="flex flex-col items-center gap-8">
          <img
            src={sqbLogo}
            alt="SQB Bank"
            className="h-28 object-contain drop-shadow-2xl"
          />
          <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#004666]/20 to-transparent" />
        </div>

        {/* Main celebration content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center w-full max-w-5xl">

          {/* Title - Editorial Style */}
          <div className="mb-32">
            <h1 className="text-[110px] font-extralight text-[#004666] tracking-[0.15em] leading-none mb-6">
              TUG'ILGAN <span className="font-black text-[#e31e24] tracking-tight">KUN</span>
            </h1>
            <p className="text-[30px] text-[#004666]/40 font-medium tracking-[0.6em] uppercase">
              Bayramingiz muborak
            </p>
          </div>

          {/* Names - Floating Elegance */}
          <div className="w-full flex flex-col items-center gap-y-20 mb-16 px-8 min-h-[1600px] justify-center">
            {visibleData.length === 0 ? (
              <p className="text-[#004666]/10 text-[48px] font-extralight tracking-widest">...</p>
            ) : (
              visibleData.map((person, index) => (
                <div
                  key={`${person.id}-${index}`}
                  className="animate-fade-in-up relative"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="relative py-8 px-20">
                    <h2 className="text-[100px] font-black text-[#004666] tracking-tight leading-none mb-4">
                      {person.name}
                    </h2>
                    <div className="flex items-center justify-center gap-4">
                      <div className="h-[2px] w-8 bg-[#e31e24]/30 rounded-full" />
                      <p className="text-[36px] text-[#e31e24] font-bold uppercase tracking-[0.3em]">
                        {person.position}
                      </p>
                      <div className="h-[2px] w-8 bg-[#e31e24]/30 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer - Minimalist & Integrated */}
        <div className="flex flex-col items-center gap-6">
          <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-[#004666]/10 to-transparent" />
          <p className="text-[42px] font-light tracking-[0.2em] text-[#004666]/60">
            Samimiy tilaklar bilan <span className="text-[#004666] font-bold">SQB jamoasi</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BirthdayDisplay;