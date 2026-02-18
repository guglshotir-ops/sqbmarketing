import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
}

const GlassCard = ({ children }: GlassCardProps) => {
  return (
    <div className="relative">
      {/* Outer glow effect */}
      <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-br from-white/10 to-white/5 rounded-[30px] sm:rounded-[40px] md:rounded-[60px] blur-xl" />
      
      {/* Main glass card */}
      <div 
        className="relative backdrop-blur-xl bg-white/10 rounded-[24px] sm:rounded-[36px] md:rounded-[48px] p-6 sm:p-10 md:p-16"
        style={{
          border: 'clamp(10px, 3vw, 40px) solid rgba(255, 255, 255, 0.2)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
