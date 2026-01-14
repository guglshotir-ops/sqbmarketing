import { useBirthdayData } from '@/hooks/useBirthdayData';
import ConfettiEffect from './ConfettiEffect';
import sqbLogo from '@/assets/sqb-logo.png';
import { useState, useEffect } from 'react';

// LED Screen dimensions
const LED_WIDTH = 1536;
const LED_HEIGHT = 3456;

const BirthdayDisplay = () => {
  const { data, isLoaded } = useBirthdayData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);

  const safeData = Array.isArray(data) ? data : [];

  // Robust Scaling Engine
  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight;
      const newScale = vh / LED_HEIGHT;
      setScale(newScale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Birthday Rotation Strategy
  useEffect(() => {
    const birthdayRotation = setInterval(() => {
      const totalGroups = Math.ceil(safeData.length / 6);
      const nextIndex = currentIndex + 6;
      // Regular rotation or loop back
      setCurrentIndex(nextIndex >= (totalGroups * 6 || 1) ? 0 : nextIndex);
    }, 15000);

    return () => clearInterval(birthdayRotation);
  }, [safeData.length, currentIndex]);

  // Spinetix Keep-Alive: Invisible micro-activity
  useEffect(() => {
    const interval = setInterval(() => {
      const root = document.getElementById('root');
      if (root) {
        root.style.opacity = '0.999';
        setTimeout(() => {
          root.style.opacity = '1';
        }, 100);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const visibleData = safeData.slice(currentIndex, currentIndex + 6);

  return (
    <div className="fixed inset-0 bg-[#f4f7f9] flex items-center justify-center overflow-hidden touch-none select-none">
      <div
        className="relative bg-[#f4f7f9] text-center overflow-hidden flex flex-col"
        style={{
          width: LED_WIDTH,
          height: LED_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
        }}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-between py-40 px-16">
          {/* Background Elements - Always rendered */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[60%] bg-[#004666]/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-[-10%] right-[-20%] w-[120%] h-[50%] bg-[#e31e24]/5 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-[0.03]">
              <img src={sqbLogo} alt="" className="w-full h-auto grayscale" />
            </div>
          </div>

          {!isLoaded ? (
            <div className="w-full h-full flex items-center justify-center">
              <img src={sqbLogo} alt="" className="h-32 opacity-20 grayscale" />
            </div>
          ) : (
            <>
              <ConfettiEffect />

              {/* Header */}
              <div className="relative z-20 flex flex-col items-center gap-12 animate-fade-in">
                <img src={sqbLogo} alt="SQB Bank" className="h-32 object-contain" />
                <div className="h-[2px] w-64 bg-gradient-to-r from-transparent via-[#004666]/20 to-transparent" />
              </div>

              {/* Titles */}
              <div className="relative z-20 mt-20 animate-fade-in">
                <h1 className="text-[120px] font-extralight text-[#004666] tracking-[0.1em] leading-tight mb-10">
                  TUG'ILGAN <span className="font-black text-[#e31e24] tracking-tight">KUN</span>
                </h1>
                <p className="text-[38px] text-[#004666]/40 font-medium tracking-[0.5em] uppercase">
                  Bayramingiz muborak
                </p>
              </div>

              {/* Names List */}
              <div className="relative z-20 w-full flex flex-col items-center justify-center mb-20 flex-1">
                {safeData.length === 0 ? (
                  <p className="text-[#004666]/10 text-9xl font-extralight tracking-widest uppercase mb-10 animate-pulse">Hozircha hech kim yo'q</p>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-y-12 w-full">
                    {visibleData.map((person, index) => {
                      const baseDelay = index * 0.7;
                      return (
                        <div
                          key={`${person.id}-${currentIndex}-${index}`}
                          className="w-full"
                          style={{
                            height: '240px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <div className="py-2 flex flex-col items-center">
                            {/* Name - Stage 1 */}
                            <h2
                              className="text-[90px] font-black text-[#004666] tracking-tight leading-none mb-4 whitespace-nowrap animate-fade-in-up"
                              style={{ animationDelay: `${baseDelay}s`, animationFillMode: 'both' }}
                            >
                              {person.name}
                            </h2>

                            <div className="flex flex-col items-center min-h-[60px] w-full">
                              {/* Department - Stage 2 (+0.2s) */}
                              <p
                                className="text-[32px] text-[#e31e24] font-bold uppercase tracking-[0.2em] h-[40px] leading-none animate-fade-in-up"
                                style={{ animationDelay: `${baseDelay + 0.2}s`, animationFillMode: 'both' }}
                              >
                                {person.department || " "}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="relative z-20 flex flex-col items-center gap-12 mt-auto animate-fade-in">
                <div className="h-[2px] w-96 bg-gradient-to-r from-transparent via-[#004666]/10 to-transparent" />
                <p className="text-[48px] font-light tracking-[0.1em] text-[#004666]/60">
                  Samimiy tilaklar bilan <span className="text-[#004666] font-bold">SQB jamoasi</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        body { overflow: hidden !important; background: #f4f7f9 !important; }
        @keyframes ios-reveal {
          0% { 
            opacity: 0; 
            transform: translateY(40px) scale(0.98);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in-up {
          animation: ios-reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        .animate-fade-in {
          animation: fade-in 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BirthdayDisplay;