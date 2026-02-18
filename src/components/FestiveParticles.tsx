import { useEffect, useRef } from 'react';

// LED Screen dimensions (must match BirthdayDisplay.tsx)
const LED_WIDTH = 1536;
const LED_HEIGHT = 3456;

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
  type: 'bokeh' | 'sparkle' | 'star';
}

const FestiveParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set fixed LED screen size
    canvas.width = LED_WIDTH;
    canvas.height = LED_HEIGHT;

    const particles: Particle[] = [];
    const particleCount = 120; // More particles for large screen

    // Premium color palette
    const colors = [
      { r: 255, g: 215, b: 100 },  // Gold
      { r: 255, g: 240, b: 180 },  // Light gold
      { r: 255, g: 255, b: 255 },  // White
      { r: 200, g: 220, b: 255 },  // Ice blue
      { r: 180, g: 160, b: 255 },  // Soft purple
    ];

    const types: ('bokeh' | 'sparkle' | 'star')[] = ['bokeh', 'bokeh', 'sparkle', 'star'];

    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * LED_WIDTH,
        y: Math.random() * LED_HEIGHT,
        size: Math.random() * 12 + 4, // Bigger particles for LED screen
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.6 - 0.3,
        opacity: Math.random() * 0.5 + 0.2,
        color: `${color.r}, ${color.g}, ${color.b}`,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, opacity: number, color: string) => {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = `rgba(${color}, ${opacity})`;
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, LED_WIDTH, LED_HEIGHT);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.pulse += particle.pulseSpeed;

        // Wrap around screen
        if (particle.x < -40) particle.x = LED_WIDTH + 40;
        if (particle.x > LED_WIDTH + 40) particle.x = -40;
        if (particle.y < -40) particle.y = LED_HEIGHT + 40;
        if (particle.y > LED_HEIGHT + 40) particle.y = -40;

        // Pulsing opacity for sparkle effect
        const pulseOpacity = particle.opacity * (0.5 + Math.sin(particle.pulse) * 0.5);

        if (particle.type === 'bokeh') {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 4
          );
          gradient.addColorStop(0, `rgba(${particle.color}, ${pulseOpacity * 0.8})`);
          gradient.addColorStop(0.4, `rgba(${particle.color}, ${pulseOpacity * 0.3})`);
          gradient.addColorStop(1, `rgba(${particle.color}, 0)`);

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${particle.color}, ${pulseOpacity})`;
          ctx.fill();
        } else if (particle.type === 'sparkle') {
          const len = particle.size * 3;
          ctx.strokeStyle = `rgba(${particle.color}, ${pulseOpacity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(particle.x - len, particle.y);
          ctx.lineTo(particle.x + len, particle.y);
          ctx.moveTo(particle.x, particle.y - len);
          ctx.lineTo(particle.x, particle.y + len);
          ctx.stroke();

          const glow = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
          );
          glow.addColorStop(0, `rgba(${particle.color}, ${pulseOpacity})`);
          glow.addColorStop(1, `rgba(${particle.color}, 0)`);
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        } else if (particle.type === 'star') {
          drawStar(particle.x, particle.y, 4, particle.size * 2, particle.size * 0.6, pulseOpacity, particle.color);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Cleanup
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: LED_WIDTH,
        height: LED_HEIGHT,
        zIndex: 5,
        pointerEvents: 'none',
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default FestiveParticles;
