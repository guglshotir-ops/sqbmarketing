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
  color: string;
  rotation: number;
  rotationSpeed: number;
}

const ConfettiEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set fixed LED screen size
    canvas.width = LED_WIDTH;
    canvas.height = LED_HEIGHT;

    // SQB brand colors: navy, red, gray, white
    const colors = ['#004666', '#e31e24', '#a7a9ac', '#FFFFFF', '#004666', '#e31e24'];

    const createParticle = (): Particle => ({
      x: Math.random() * LED_WIDTH,
      y: Math.random() * LED_HEIGHT - LED_HEIGHT,
      size: Math.random() * 16 + 8, // Bigger confetti for LED screen
      speedX: (Math.random() - 0.5) * 4,
      speedY: Math.random() * 4 + 2, // Faster for bigger screen
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    });

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < 80; i++) { // Optimized particle count for large screen performance
        const particle = createParticle();
        particle.y = Math.random() * LED_HEIGHT;
        particlesRef.current.push(particle);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, LED_WIDTH, LED_HEIGHT);

      particlesRef.current.forEach((particle, index) => {
        particle.y += particle.speedY;
        particle.x += particle.speedX;
        particle.rotation += particle.rotationSpeed;

        // Reset particle when it goes off screen
        if (particle.y > LED_HEIGHT) {
          particlesRef.current[index] = createParticle();
        }

        // Draw confetti piece
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 0.9;

        // Draw rectangle confetti
        ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
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
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ConfettiEffect;