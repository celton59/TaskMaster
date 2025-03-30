import { useEffect, useRef } from 'react';

export function EnhancedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ajustar tamaño del canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Variables para el efecto
    const PARTICLE_COUNT = 100;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
      pulseSpeed: number;
      pulseSize: number;
    }> = [];
    
    // Colores neón
    const neonColors = [
      '#00e1ff', // Azul neón
      '#bb00ff', // Púrpura neón
      '#ff00aa', // Rosa neón
      '#00ff9d', // Verde neón
      '#ffea00'  // Amarillo neón
    ];
    
    // Mouse position
    let mouseX = -1000;
    let mouseY = -1000;
    
    // Inicializar partículas
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = Math.random() * 2 + 1;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: radius,
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        pulseSpeed: Math.random() * 0.05 + 0.01,
        pulseSize: radius
      });
    }
    
    // Listener para seguir el cursor
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Función para dibujar una partícula con efecto de neón
    const drawNeonParticle = (
      x: number, 
      y: number, 
      radius: number, 
      color: string,
      shadowBlur: number = 15
    ) => {
      // Partícula central
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Efecto de resplandor neón
      ctx.shadowColor = color;
      ctx.shadowBlur = shadowBlur;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Resetear sombra
      ctx.shadowBlur = 0;
    };
    
    // Línea con efecto de neón
    const drawNeonLine = (
      x1: number, 
      y1: number, 
      x2: number, 
      y2: number, 
      color: string,
      width: number = 0.5,
      alpha: number = 0.3
    ) => {
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = width;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Efecto de brillo
      ctx.shadowColor = color;
      ctx.shadowBlur = 5;
      ctx.stroke();
      
      // Resetear valores
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };
    
    // Función de animación
    const animate = () => {
      // Clear con efecto de trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Actualizar y dibujar partículas
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Actualizar tamaño con efecto de pulso
        p.radius = p.pulseSize + Math.sin(Date.now() * p.pulseSpeed) * 0.5;
        
        // Actualizar posición
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Interacción con el mouse
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const angle = Math.atan2(dy, dx);
          const force = (150 - distance) / 150;
          
          // Atraer partículas hacia el cursor
          p.speedX += Math.cos(angle) * force * 0.2;
          p.speedY += Math.sin(angle) * force * 0.2;
        }
        
        // Limitar velocidad
        const speed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
        if (speed > 2) {
          p.speedX = (p.speedX / speed) * 2;
          p.speedY = (p.speedY / speed) * 2;
        }
        
        // Rebote en los bordes
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        // Dibujar partícula
        drawNeonParticle(p.x, p.y, p.radius, p.color);
        
        // Conectar partículas cercanas
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const alpha = 1 - distance / 100;
            drawNeonLine(p.x, p.y, p2.x, p2.y, p.color, 0.5, alpha * 0.3);
          }
        }
      }
      
      // Efecto radial alrededor del cursor
      if (mouseX > 0 && mouseY > 0) {
        for (let i = 0; i < 360; i += 36) {
          const angle = i * Math.PI / 180;
          const x = mouseX + Math.cos(angle) * 50;
          const y = mouseY + Math.sin(angle) * 50;
          
          ctx.beginPath();
          ctx.moveTo(mouseX, mouseY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = neonColors[i % neonColors.length];
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    // Iniciar animación
    const animationId = requestAnimationFrame(animate);
    
    // Limpiar al desmontar
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ 
        opacity: 0.8, 
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(5,10,20,0.95))'
      }}
    />
  );
}