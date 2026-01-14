import { useBirthdayData } from '@/hooks/useBirthdayData';
import ConfettiEffect from './ConfettiEffect';
import sqbLogo from '@/assets/sqb-logo.png';
import { useState, useEffect } from 'react';

// LED Screen dimensions
const LED_WIDTH = 1536;
const LED_HEIGHT = 3456;

const BirthdayDisplay = () => {
  const { data, activeVideos, isLoaded } = useBirthdayData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [displayMode, setDisplayMode] = useState<'birthday' | 'video'>('birthday');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [birthdayStartTime, setBirthdayStartTime] = useState(Date.now());
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const safeData = Array.isArray(data) ? data : [];
  const safeVideos = Array.isArray(activeVideos) ? activeVideos : [];

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

  // Smart Timing: Check if current time is peak hours (8:30-9:30)
  const isPeakHours = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes; // Convert to minutes
    const peakStart = 8 * 60 + 30;  // 8:30
    const peakEnd = 9 * 60 + 30;    // 9:30
    return currentTime >= peakStart && currentTime <= peakEnd;
  };

  // Mode and Rotation Strategy
  useEffect(() => {
    if (displayMode === 'birthday') {
      // Calculate dynamic timing based on number of people
      const secondsPerPerson = 3;
      const peopleCount = safeData.length || 1;
      const totalGroups = Math.ceil(peopleCount / 6) || 1;
      
      // Slide interval = total time / number of slides (minimum 5 sec)
      const baseShowTime = peopleCount * secondsPerPerson;
      const slideInterval = Math.max(5000, (baseShowTime / totalGroups) * 1000);

      const birthdayRotation = setInterval(() => {
        const nextIndex = currentIndex + 6;

        // If we have finished all names, and there are videos, switch to video
        if (nextIndex >= safeData.length && safeVideos.length > 0) {
          // Smart timing: 3 sec per person, with peak multiplier
          const repetitions = isPeakHours() ? 2 : 1; // 2x in peak hours
          const minShowTime = baseShowTime * repetitions;
          
          const elapsed = (Date.now() - birthdayStartTime) / 1000;
          if (elapsed >= minShowTime) {
            console.log(`Switching to video (${peopleCount} people, elapsed: ${elapsed}s, min: ${minShowTime}s, peak: ${isPeakHours()})`);
            setDisplayMode('video');
            setCurrentIndex(0);
            setVideoLoadError(false);
            return;
          }
        }

        // Regular rotation or loop back
        setCurrentIndex(nextIndex >= (totalGroups * 6) ? 0 : nextIndex);
      }, slideInterval);

      return () => clearInterval(birthdayRotation);
    }
  }, [displayMode, safeData.length, safeVideos.length, currentIndex, birthdayStartTime]);

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

  const handleVideoEnd = () => {
    setVideoLoadError(false);
    setVideoPlaying(false);
    if (safeVideos.length > 0) {
      // After video ends, return to birthdays and queue next video
      setBirthdayStartTime(Date.now());
      setDisplayMode('birthday');
      setCurrentIndex(0);
      setCurrentVideoIndex((prev) => (prev + 1) % safeVideos.length);
    } else {
      setDisplayMode('birthday');
    }
  };

  // Switch back to birthday if video fails or is empty
  useEffect(() => {
    if (displayMode === 'video' && safeVideos.length === 0) {
      setDisplayMode('birthday');
    }
  }, [displayMode, safeVideos]);

  // Video load timeout - if video doesn't START playing in 10 seconds, skip
  useEffect(() => {
    if (displayMode === 'video' && safeVideos.length > 0 && !videoPlaying) {
      const timeout = setTimeout(() => {
        if (!videoPlaying) {
          console.log('Video load timeout - skipping video:', safeVideos[currentVideoIndex]?.url);
          setVideoLoadError(true);
          // Skip to next video or return to birthdays
          if (safeVideos.length > 1) {
            setCurrentVideoIndex((prev) => (prev + 1) % safeVideos.length);
            setVideoLoadError(false);
          } else {
            handleVideoEnd();
          }
        }
      }, 10000); // 10 seconds timeout for loading

      return () => clearTimeout(timeout);
    }
  }, [displayMode, safeVideos.length, currentVideoIndex, videoPlaying]);

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
          ) : displayMode === 'birthday' ? (
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
                <p className="text-[24px] text-[#004666]/30 mt-4">test ## v2.2</p>
              </div>
            </>
          ) : (
            // Video Mode
            <div className="absolute inset-0 z-50 bg-[#f4f7f9] flex items-center justify-center animate-fade-in">
              {(() => {
                const videoItem = safeVideos[currentVideoIndex];
                const videoUrl = videoItem?.url;
                
                if (!videoUrl) {
                  // No video available, return to birthday
                  setTimeout(() => {
                    setDisplayMode('birthday');
                    setBirthdayStartTime(Date.now());
                  }, 1000);
                  return (
                    <div className="text-center">
                      <img src={sqbLogo} alt="" className="h-32 opacity-20 grayscale mx-auto mb-4" />
                      <p className="text-[#004666]/40 text-2xl">Video topilmadi</p>
                    </div>
                  );
                }

                // Handle Google Drive URLs (both /d/ and /uc?export=download formats)
                if (videoUrl.includes('drive.google.com')) {
                  let fileId = null;
                  
                  // Try /d/ format first
                  const dMatch = videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                  if (dMatch) {
                    fileId = dMatch[1];
                  } else {
                    // Try /uc?export=download format
                    const ucMatch = videoUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                    if (ucMatch) {
                      fileId = ucMatch[1];
                    }
                  }
                  
                  if (fileId) {
                    return (
                      <iframe
                        src={`https://drive.google.com/file/d/${fileId}/preview`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          backgroundColor: '#000'
                        }}
                        allow="autoplay; fullscreen"
                        onLoad={() => {
                          console.log('Google Drive iframe loaded');
                          setVideoPlaying(true);
                          // Auto-return after 30 seconds for Google Drive videos
                          setTimeout(() => {
                            handleVideoEnd();
                          }, 30000);
                        }}
                        onError={() => {
                          console.error('Google Drive iframe error');
                          handleVideoEnd();
                        }}
                      />
                    );
                  } else {
                    console.error('Could not extract Google Drive file ID from:', videoUrl);
                    handleVideoEnd();
                    return null;
                  }
                }
                
                // Regular video tag for direct URLs
                return (
                  <video
                    key={videoUrl} // Force re-render on URL change
                    src={videoUrl}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    className="block"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'fill',
                      backgroundColor: '#000'
                    }}
                    onPlay={() => {
                      console.log('Video started playing:', videoUrl);
                      setVideoPlaying(true);
                      setVideoLoadError(false);
                    }}
                    onLoadedData={() => {
                      console.log('Video loaded successfully:', videoUrl);
                      setVideoLoadError(false);
                    }}
                    onCanPlay={() => {
                      console.log('Video can play:', videoUrl);
                      setVideoLoadError(false);
                    }}
                    onLoadStart={() => {
                      console.log('Video load started:', videoUrl);
                      setVideoLoadError(false);
                    }}
                    onStalled={() => {
                      console.warn('Video stalled:', videoUrl);
                    }}
                    onWaiting={() => {
                      console.warn('Video waiting for data:', videoUrl);
                    }}
                    onEnded={handleVideoEnd}
                    onError={(e) => {
                      console.error('Video error:', videoUrl, e);
                      setVideoLoadError(true);
                      handleVideoEnd();
                    }}
                  />
                );
              })()}
            </div>
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