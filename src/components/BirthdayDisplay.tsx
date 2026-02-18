import { useBirthdayData } from '@/hooks/useBirthdayData';
import ConfettiEffect from './ConfettiEffect';
import sqbLogo from '@/assets/sqb-logo.png';
import { useState, useEffect, useRef } from 'react';

// LED Screen dimensions
const LED_WIDTH = 1536;
const LED_HEIGHT = 3456;

// Colors defined inline where needed

const BirthdayDisplay = () => {
  const { data, activeVideos, isLoaded } = useBirthdayData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [displayMode, setDisplayMode] = useState<'birthday' | 'video'>(() => {
    const hours = new Date().getHours();
    return (hours >= 8 && hours < 10) ? 'birthday' : 'video';
  });
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [birthdayStartTime, setBirthdayStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(new Date());

  const safeData = Array.isArray(data) ? data : [];
  const safeVideos = Array.isArray(activeVideos) ? activeVideos : [];

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isWithinHours = (startHour: number, endHour: number) => {
    const hours = currentTime.getHours();
    return hours >= startHour && hours < endHour;
  };

  const isMonitorOn = isWithinHours(8, 20); // 08:00 - 20:00
  const isBirthdayWindow = isWithinHours(8, 10); // Birthday List: 08:00 - 10:00

  // Scaling
  useEffect(() => {
    const handleResize = () => setScale(window.innerHeight / LED_HEIGHT);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mode Selection logic based on time and data availability
  useEffect(() => {
    if (!isLoaded) return;

    const hasBirthdays = safeData.length > 0;
    const isBirthdayTime = isBirthdayWindow && hasBirthdays;

    // Switch TO birthday when it's birthday time and we're in video mode
    if (isBirthdayTime && displayMode === 'video') {
      setBirthdayStartTime(Date.now());
      setDisplayMode('birthday');
      setCurrentIndex(0);
    }
    // Switch AWAY from birthday when it's not birthday time
    else if (!isBirthdayTime && displayMode === 'birthday') {
      setDisplayMode('video');
    }
  }, [isLoaded, safeData.length, isBirthdayWindow]);

  // Video State - with caching to prevent excessive Storage requests
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A');
  const [playerAUrl, setPlayerAUrl] = useState('');
  const [playerBUrl, setPlayerBUrl] = useState('');
  const [playerAPlaying, setPlayerAPlaying] = useState(false);
  const [playerBPlaying, setPlayerBPlaying] = useState(false);
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  // Cache refs to prevent redundant URL updates
  const lastLoadedIndexA = useRef<number>(-1);
  const lastLoadedIndexB = useRef<number>(-1);

  // Preloading - load videos when they become available
  useEffect(() => {
    if (safeVideos.length === 0) return;

    const currentUrl = safeVideos[currentVideoIndex]?.url || '';
    const nextIndex = (currentVideoIndex + 1) % safeVideos.length;
    const nextUrl = safeVideos[nextIndex]?.url || '';

    if (activePlayer === 'A') {
      // Only update if this is a new video index
      if (lastLoadedIndexA.current !== currentVideoIndex) {
        setPlayerAUrl(currentUrl);
        lastLoadedIndexA.current = currentVideoIndex;
      }
      // Preload next video in player B only if not already loaded
      if (lastLoadedIndexB.current !== nextIndex && safeVideos.length > 1) {
        setPlayerBUrl(nextUrl);
        lastLoadedIndexB.current = nextIndex;
        setPlayerBPlaying(false);
      }
    } else {
      // Only update if this is a new video index
      if (lastLoadedIndexB.current !== currentVideoIndex) {
        setPlayerBUrl(currentUrl);
        lastLoadedIndexB.current = currentVideoIndex;
      }
      // Preload next video in player A only if not already loaded
      if (lastLoadedIndexA.current !== nextIndex && safeVideos.length > 1) {
        setPlayerAUrl(nextUrl);
        lastLoadedIndexA.current = nextIndex;
        setPlayerAPlaying(false);
      }
    }
  }, [currentVideoIndex, activePlayer, safeVideos.length]); // Added safeVideos.length for initial load

  // Playback Control - manages video play/pause and reset
  useEffect(() => {
    if (!isMonitorOn) return;
    if (displayMode === 'video') {
      const activeRef = activePlayer === 'A' ? videoRefA : videoRefB;
      const activeUrl = activePlayer === 'A' ? playerAUrl : playerBUrl;
      // Only play if we have a URL
      if (activeRef.current && activeUrl) {
        activeRef.current.currentTime = 0;
        activeRef.current.play().catch(() => { });
      }
    } else {
      // Pause and reset videos when showing birthday list
      if (videoRefA.current) {
        videoRefA.current.pause();
        videoRefA.current.currentTime = 0;
      }
      if (videoRefB.current) {
        videoRefB.current.pause();
        videoRefB.current.currentTime = 0;
      }
      setPlayerAPlaying(false);
      setPlayerBPlaying(false);
    }
  }, [displayMode, activePlayer, isMonitorOn, playerAUrl, playerBUrl]);

  const handleVideoEnd = () => {
    const nextIndex = (currentVideoIndex + 1) % (safeVideos.length || 1);
    setCurrentVideoIndex(nextIndex);
    setActivePlayer(prev => prev === 'A' ? 'B' : 'A');

    // Return to birthdays ONLY if scheduled and data exists
    if (isBirthdayWindow && safeData.length > 0) {
      setBirthdayStartTime(Date.now());
      setDisplayMode('birthday');
      setCurrentIndex(0);
    }
  };

  // Smart Timing: Check if current time is peak hours (8:30-9:30)
  const isPeakHours = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const currentMin = hours * 60 + minutes;
    return currentMin >= (8 * 60 + 30) && currentMin <= (9 * 60 + 30);
  };

  // Birthday Rotation & Mode Strategy
  useEffect(() => {
    if (displayMode === 'birthday' && safeData.length > 0) {
      const peopleCount = safeData.length;
      const totalGroups = Math.ceil(peopleCount / 6);

      // Original v2.4 logic: 2.5s per person, min 10s total
      const baseShowTime = Math.max(10, peopleCount * 2.5);
      const slideInterval = Math.max(5000, (baseShowTime / totalGroups) * 1000);

      const timer = setInterval(() => {
        const nextIndex = currentIndex + 6;

        // If we reached the end of the list
        if (nextIndex >= safeData.length && safeVideos.length > 0) {
          const repetitions = isPeakHours() ? 2 : 1;
          const minShowTime = baseShowTime * repetitions;
          const elapsed = (Date.now() - birthdayStartTime) / 1000;

          if (elapsed >= minShowTime) {
            setDisplayMode('video');
            setCurrentIndex(0);
            return;
          }
        }

        // Loop back or next page
        setCurrentIndex(nextIndex >= (totalGroups * 6) ? 0 : nextIndex);
      }, slideInterval);

      return () => clearInterval(timer);
    }
  }, [displayMode, safeData.length, safeVideos.length, currentIndex, birthdayStartTime]);

  if (!isMonitorOn) {
    return <div className="fixed inset-0 bg-black z-[9999]" />;
  }

  const isCurrentPlaying = activePlayer === 'A' ? playerAPlaying : playerBPlaying;
  const visibleData = safeData.slice(currentIndex, currentIndex + 6);

  const renderVideoPlayer = (url: string, id: 'A' | 'B') => {
    if (!url) return null;
    const isActive = activePlayer === id;
    const isPlaying = id === 'A' ? playerAPlaying : playerBPlaying;

    // Show video when active and playing
    const shouldShow = isActive && displayMode === 'video' && isPlaying;

    return (
      <div key={id} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: shouldShow ? 1 : 0, zIndex: isActive ? 50 : 40 }}>
        <video
          ref={id === 'A' ? videoRefA : videoRefB}
          src={url}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-fill"
          onPlay={() => {
            if (id === 'A') setPlayerAPlaying(true); else setPlayerBPlaying(true);
          }}
          onEnded={() => isActive && handleVideoEnd()}
          onError={() => isActive && handleVideoEnd()}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#001a2c] flex items-center justify-center overflow-hidden touch-none select-none">
      <div className="relative text-center overflow-hidden flex flex-col" style={{ width: LED_WIDTH, height: LED_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <div className="relative w-full h-full flex flex-col items-center justify-between py-40 px-16">
          {/* Background Watermark Logo (Centered behind everything) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] flex items-center justify-center">
            <img src={sqbLogo} alt="" className="w-[120%] h-auto grayscale" />
          </div>

          {!isLoaded ? (
            <div className="w-full h-full flex items-center justify-center">
              <img src={sqbLogo} alt="" className="h-32 opacity-20 grayscale" />
            </div>
          ) : (
            <>
              {/* Birthday Layer - EXACT v2.4 Design RESTORED */}
              <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-between py-40 px-16 transition-opacity duration-1000"
                style={{
                  opacity: (isBirthdayWindow && safeData.length > 0 && (displayMode === 'birthday' || !isCurrentPlaying)) ? 1 : 0,
                  pointerEvents: 'none',
                  backgroundColor: '#f4f7f9'
                }}
              >
                {/* Background Decor Elements from v2.4 */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[60%] bg-[#004666]/10 rounded-full blur-[150px]" />
                  <div className="absolute bottom-[-10%] right-[-20%] w-[120%] h-[50%] bg-[#e31e24]/5 rounded-full blur-[120px]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-[0.03]">
                    <img src={sqbLogo} alt="" className="w-full h-auto grayscale" />
                  </div>
                </div>

                <ConfettiEffect />

                {/* Header Section */}
                <div className="relative z-20 flex flex-col items-center gap-12 animate-fade-in">
                  <img src={sqbLogo} alt="SQB Bank" className="h-32 object-contain" />
                  <div className="h-[2px] w-64 bg-gradient-to-r from-transparent via-[#004666]/20 to-transparent" />
                </div>

                {/* Titles Section */}
                <div className="relative z-20 mt-20 animate-fade-in text-center">
                  <h1 className="text-[120px] font-extralight text-[#004666] tracking-[0.1em] leading-tight mb-10">
                    TUG'ILGAN <span className="font-black text-[#e31e24] tracking-tight">KUN</span>
                  </h1>
                  <p className="text-[38px] text-[#004666]/40 font-medium tracking-[0.5em] uppercase">
                    Bayramingiz muborak
                  </p>
                </div>

                {/* Names Section (Middle) */}
                <div className="relative z-20 w-full flex flex-col items-center justify-center mb-20 flex-1">
                  {safeData.length > 0 && (
                    <div className="flex flex-col items-center justify-center gap-y-12 w-full">
                      {visibleData.map((person, index) => (
                        <div key={`${person.id}-${currentIndex}-${index}`} className="w-full h-[240px] flex flex-col justify-center">
                          <div className="py-2 flex flex-col items-center">
                            <h2 className="text-[90px] font-black text-[#004666] tracking-tight leading-none mb-4 whitespace-nowrap animate-fade-in-up"
                              style={{ animationDelay: `${index * 0.7}s`, animationFillMode: 'both' }}>
                              {person.name}
                            </h2>
                            <p className="text-[32px] text-[#e31e24] font-bold uppercase tracking-[0.2em] h-[40px] leading-none animate-fade-in-up"
                              style={{ animationDelay: `${index * 0.7 + 0.2}s`, animationFillMode: 'both' }}>
                              {person.department || " "}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Section */}
                <div className="relative z-20 flex flex-col items-center gap-12 mt-auto animate-fade-in w-full">
                  <div className="h-[2px] w-96 bg-gradient-to-r from-transparent via-[#004666]/10 to-transparent" />
                  <p className="text-[48px] font-light tracking-[0.1em] text-[#004666]/60">
                    Samimiy tilaklar bilan <span className="text-[#004666] font-bold">SQB jamoasi</span>
                  </p>
                </div>
              </div>

              {/* Video Layer */}
              <div className="absolute inset-0 z-40 bg-transparent pointer-events-none overflow-hidden">
                {renderVideoPlayer(playerAUrl, 'A')}
                {renderVideoPlayer(playerBUrl, 'B')}
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`
        body { overflow: hidden !important; background: #001a2c !important; font-family: 'Inter', sans-serif; }
        @keyframes ios-reveal { 0% { opacity: 0; transform: translateY(60px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in-up { animation: ios-reveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 1.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default BirthdayDisplay;