
import React, { useEffect, useRef } from 'react';
import { Theme } from '../types.ts';

interface FluidBackgroundProps {
  theme: Theme;
}

const FluidBackground: React.FC<FluidBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, lastSpawn: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const particles: Particle[] = [];
    const MAX_PARTICLES = theme === Theme.DARK ? 1200 : 900;
    let animationFrameId: number;

    const colors = theme === Theme.DARK 
      ? [
          { r: 0, g: 166, b: 81 },   // ICT Green
          { r: 237, g: 28, b: 36 },  // BD Red
          { r: 255, g: 255, b: 255 },// Data White
          { r: 0, g: 255, b: 180 }   // Tech Teal
        ] 
      : [
          { r: 0, g: 150, b: 70 },   // Crisp Green
          { r: 210, g: 20, b: 35 },  // Bold Red
          { r: 0, g: 100, b: 255 },  // Azure Blue
          { r: 100, g: 100, b: 110 } // Slate Grey
        ];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      maxSize: number;
      color: { r: number, g: number, b: number };
      life: number;
      maxLife: number;
      friction: number;

      constructor(x: number, y: number, mvx: number, mvy: number) {
        this.x = x;
        this.y = y;
        this.vx = mvx * 0.15 + (Math.random() - 0.5) * 1.8;
        this.vy = mvy * 0.15 + (Math.random() - 0.5) * 1.8;
        this.maxSize = theme === Theme.DARK ? (Math.random() * 28 + 6) : (Math.random() * 22 + 5);
        this.size = 1.5; 
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.maxLife = Math.random() * 90 + 50;
        this.life = this.maxLife;
        this.friction = 0.96;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;
        const growthRate = 0.035;
        this.size += (this.maxSize - this.size) * growthRate;
        this.life--;
      }

      draw() {
        if (!ctx) return;
        const progress = this.life / this.maxLife;
        const alpha = Math.sin(progress * Math.PI) * (theme === Theme.DARK ? 0.25 : 0.35);
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0, 
          this.x, this.y, this.size
        );
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        if (Math.random() > 0.985 && this.life > this.maxLife * 0.4) {
            ctx.fillStyle = theme === Theme.DARK ? `rgba(255, 255, 255, ${alpha * 1.5})` : `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
            ctx.fillRect(this.x, this.y, 1.5, 1.5);
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dx = e.clientX - mouseRef.current.x;
      const dy = e.clientY - mouseRef.current.y;
      mouseRef.current.vx = dx;
      mouseRef.current.vy = dy;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      if (now - mouseRef.current.lastSpawn > 6) {
        const speed = Math.sqrt(dx * dx + dy * dy);
        const spawnCount = Math.min(Math.floor(speed / 1.8) + 4, 15);
        for (let i = 0; i < spawnCount; i++) {
          if (particles.length < MAX_PARTICLES) {
            const lerpX = e.clientX - dx * (i / spawnCount);
            const lerpY = e.clientY - dy * (i / spawnCount);
            particles.push(new Particle(lerpX, lerpY, dx, dy));
          }
        }
        mouseRef.current.lastSpawn = now;
      }
    };

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = theme === Theme.DARK ? 'screen' : 'source-over';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0 || p.size < 0.2) {
          particles.splice(i, 1);
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas 
      id="fluid" 
      ref={canvasRef} 
      style={{ 
        filter: theme === Theme.DARK ? 'blur(2px) contrast(1.1)' : 'blur(4px) opacity(0.85)',
        mixBlendMode: theme === Theme.DARK ? 'screen' : 'normal',
        pointerEvents: 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 1
      }} 
    />
  );
};

export default FluidBackground;
