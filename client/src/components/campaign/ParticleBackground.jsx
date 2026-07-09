import { useEffect, useRef } from 'react';

/**
 * Enhanced floating particle system with varying sizes, speeds, and glow effects.
 */
const ParticleBackground = ({ primaryColor = '#ec4899', secondaryColor = '#8b5cf6' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let mouseX = -1000;
    let mouseY = -1000;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Track mouse for subtle interaction
    const handleMouse = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouse);

    const createParticle = (isInitial = false) => {
      const isHeart = Math.random() > 0.72;
      const isBig = Math.random() > 0.85;
      return {
        x: Math.random() * canvas.width,
        y: isInitial ? Math.random() * canvas.height : canvas.height + 20,
        size: isHeart ? Math.random() * 8 + 5 : isBig ? Math.random() * 4 + 3 : Math.random() * 2.5 + 0.5,
        speedY: -(Math.random() * 0.8 + 0.15) * (isHeart ? 0.6 : 1),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: isHeart ? Math.random() * 0.3 + 0.12 : isBig ? Math.random() * 0.5 + 0.2 : Math.random() * 0.35 + 0.05,
        color: isHeart
          ? (Math.random() > 0.5 ? primaryColor : '#f472b6')
          : Math.random() > 0.6 ? primaryColor : Math.random() > 0.3 ? secondaryColor : '#06b6d4',
        isHeart,
        life: isInitial ? Math.random() * 400 : 0,
        maxLife: Math.random() * 500 + 300,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.005,
      };
    };

    // Draw a small heart shape centered near (x, y)
    const drawHeart = (c, x, y, s) => {
      c.beginPath();
      c.moveTo(x, y - s * 0.25);
      c.bezierCurveTo(x - s * 0.5, y - s * 0.75, x - s, y - s * 0.1, x, y + s * 0.55);
      c.moveTo(x, y - s * 0.25);
      c.bezierCurveTo(x + s * 0.5, y - s * 0.75, x + s, y - s * 0.1, x, y + s * 0.55);
      c.fill();
    };

    // Initial particles
    for (let i = 0; i < 60; i++) {
      particles.push(createParticle(true));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles
      if (particles.length < 100 && Math.random() > 0.9) {
        particles.push(createParticle());
      }

      particles = particles.filter(p => {
        // Wobble motion
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.3;
        p.y += p.speedY;
        p.life++;

        // Mouse repulsion (subtle)
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.5;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Fade in/out
        let alpha = p.opacity;
        if (p.life < 40) alpha = (p.life / 40) * p.opacity;
        if (p.life > p.maxLife - 50) alpha = ((p.maxLife - p.life) / 50) * p.opacity;

        if (p.life > p.maxLife || p.y < -30) return false;

        // Draw particle with multi-layer glow
        ctx.save();
        ctx.globalAlpha = alpha;

        if (p.isHeart) {
          // Soft glowing heart drifting upward
          ctx.fillStyle = p.color;
          ctx.shadowBlur = p.size * 3;
          ctx.shadowColor = p.color;
          drawHeart(ctx, p.x, p.y, p.size);
        } else {
          // Outer glow
          ctx.fillStyle = p.color;
          ctx.shadowBlur = p.size * 8;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Bright core
          ctx.globalAlpha = alpha * 1.5;
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [primaryColor, secondaryColor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.75 }}
    />
  );
};

export default ParticleBackground;
