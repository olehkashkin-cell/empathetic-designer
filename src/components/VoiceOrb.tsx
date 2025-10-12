import { useEffect, useRef } from 'react';

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
}

const VoiceOrb = ({ isListening, isSpeaking }: VoiceOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    let animationFrame: number;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const baseRadius = 120;
      const pulseIntensity = isListening || isSpeaking ? 20 : 10;
      
      // Draw multiple rings with glow effect
      for (let i = 0; i < 3; i++) {
        const offset = i * 15;
        const radius = baseRadius + offset + Math.sin(time * 0.05 + i) * pulseIntensity;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(centerX, centerY, radius - 5, centerX, centerY, radius + 5);
        gradient.addColorStop(0, 'rgba(0, 191, 255, 0)');
        gradient.addColorStop(0.5, `rgba(0, 191, 255, ${0.3 - i * 0.1})`);
        gradient.addColorStop(1, 'rgba(0, 191, 255, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw particles
      if (isListening || isSpeaking) {
        const particleCount = 80;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const distance = baseRadius + Math.sin(time * 0.05 + i * 0.5) * 30;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          const size = Math.random() * 2 + 1;
          
          ctx.fillStyle = `rgba(0, 191, 255, ${0.5 + Math.sin(time * 0.1 + i) * 0.3})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      time += 1;
      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isListening, isSpeaking]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="max-w-full"
      />
    </div>
  );
};

export default VoiceOrb;
