import React from 'react';

interface RobotHeadProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export const RobotHead: React.FC<RobotHeadProps> = ({ 
  width = 60, 
  height = 60,
  className = '',
  color = 'var(--neon-accent)'
}) => {
  const robotColor = color;
  const glowColor = color.includes('purple') ? 'rgba(187,0,255,0.6)' : 
                    color.includes('green') ? 'rgba(0,255,157,0.6)' : 
                    color.includes('yellow') ? 'rgba(255,234,0,0.6)' : 
                    'rgba(0,225,255,0.6)';
  
  const eyeColor = color;
  const eyeBrightColor = '#ffffff';
  
  const cigaretteGlow = 'rgba(255, 100, 50, 0.7)';
  const smokeColor = 'rgba(200, 200, 200, 0.8)';
  
  return (
    <div className={`robot-head-container ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .robot-head-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          filter: drop-shadow(0 0 8px ${glowColor});
        }
        
        .robot-part {
          fill: rgba(10, 10, 20, 0.95);
          stroke: ${robotColor};
          stroke-width: 2;
          filter: drop-shadow(0 0 3px ${glowColor});
        }

        .robot-panel {
          fill: rgba(5, 5, 15, 0.9);
          stroke: ${robotColor};
          stroke-width: 1.5;
        }

        .robot-detail {
          fill: none;
          stroke: ${robotColor};
          stroke-width: 1.5;
          opacity: 1;
        }
        
        .robot-detail-solid {
          fill: ${robotColor};
          opacity: 1;
        }

        .robot-antenna {
          fill: none;
          stroke: ${robotColor};
          stroke-width: 1.5;
          filter: drop-shadow(0 0 2px ${glowColor});
        }
        
        .robot-antenna-tip {
          fill: ${robotColor};
          filter: drop-shadow(0 0 3px ${glowColor});
          animation: antenna-pulse 1.5s ease-in-out infinite alternate;
        }
        
        @keyframes antenna-pulse {
          0%   { filter: drop-shadow(0 0 2px ${glowColor}); opacity: 0.7; }
          100% { filter: drop-shadow(0 0 5px ${glowColor}); opacity: 1; }
        }

        .robot-glow {
          fill: ${robotColor};
          opacity: 0.15;
          filter: blur(5px);
        }

        .robot-eye {
          fill: ${eyeBrightColor};
          filter: drop-shadow(0 0 2px ${eyeBrightColor});
          animation: eyeGlow 3s infinite alternate;
        }
        
        .robot-eye-scanner {
          animation: eyeScan 2s infinite;
          stroke-dasharray: 20;
          stroke-dashoffset: 0;
        }
        
        @keyframes eyeScan {
          0% { stroke-dashoffset: 20; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
        
        .robot-eye-pupil {
          fill: ${eyeColor};
          filter: drop-shadow(0 0 1px ${eyeColor});
          animation: pupilPulse 3s infinite alternate;
        }
        
        .robot-chip {
          stroke: ${robotColor};
          stroke-width: 0.5;
          fill: rgba(30, 30, 40, 0.9);
        }
        
        .chip-line {
          stroke: ${robotColor};
          stroke-width: 1;
          animation: chipPulse 3s infinite alternate;
        }
        
        @keyframes chipPulse {
          0% { stroke: ${robotColor}; opacity: 0.5; }
          50% { stroke: ${eyeBrightColor}; opacity: 0.8; }
          100% { stroke: ${robotColor}; opacity: 1; }
        }
        
        #head {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: headBob 4s ease-in-out infinite;
        }
        
        @keyframes headBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-1px) rotate(1deg); }
          75% { transform: translateY(1px) rotate(-1deg); }
        }

        @keyframes eyeGlow {
          0%   { opacity: 0.8; fill: ${eyeBrightColor}; }
          50%  { opacity: 0.9; fill: ${eyeBrightColor}; }
          80% { opacity: 1; fill: ${eyeColor}; }
          100% { opacity: 1; fill: ${eyeBrightColor}; }
        }
        
        @keyframes pupilPulse {
          0%   { transform: scale(0.8); opacity: 0.8; }
          50%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }

        .robot-mouth {
          fill: none;
          stroke: ${robotColor};
          stroke-width: 1.5;
          stroke-dasharray: 2 1;
          opacity: 0.9;
          animation: mouthMove 4s infinite;
        }
        
        @keyframes mouthMove {
          0%, 20%, 80%, 100% { d: path('M 40,50 C 46,52 54,52 60,50'); }
          30%, 70% { d: path('M 40,50 C 46,50 54,50 60,50'); }
          50% { d: path('M 40,50 C 46,48 54,48 60,50'); }
        }

        .cigarette {
          stroke: white;
          stroke-linecap: round;
          filter: drop-shadow(0 0 2px ${cigaretteGlow});
        }

        .cigarette-tip {
          fill: #ff6a00;
          filter: drop-shadow(0 0 3px #ff6a00);
          animation: glowPulse 1.2s ease-in-out infinite alternate;
        }

        @keyframes glowPulse {
          0%   { fill: #ff4500; filter: drop-shadow(0 0 2px #ff4500); }
          100% { fill: #ff8700; filter: drop-shadow(0 0 4px #ff8700); }
        }

        .smoke {
          fill: ${smokeColor};
          opacity: 0;
          filter: blur(1px);
          animation: smokeAnimation 3s ease-out infinite;
        }

        .smoke-1 { animation-delay: 0s; }
        .smoke-2 { animation-delay: 1s; }
        .smoke-3 { animation-delay: 2s; }

        @keyframes smokeAnimation {
          0% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0.9;
          }
          50% {
            transform: translate(7px, -10px) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: translate(15px, -20px) scale(1.5);
            opacity: 0;
          }
        }
        
        .display-line {
          stroke: ${robotColor};
          stroke-width: 1;
          stroke-dasharray: 4 2;
          animation: lineScan 8s linear infinite;
          filter: drop-shadow(0 0 1px ${robotColor});
        }
        
        @keyframes lineScan {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 100; }
        }
        
        .status-light {
          fill: ${robotColor};
          animation: statusBlink 2s infinite alternate;
        }
        
        @keyframes statusBlink {
          0%, 90% { opacity: 0.2; }
          92% { opacity: 1; }
          94% { opacity: 0.2; }
          96% { opacity: 0.8; }
          98%, 100% { opacity: 0.2; }
        }
        
        .inner-circuit {
          fill: none;
          stroke: ${robotColor};
          stroke-width: 1;
          stroke-dasharray: 2 1;
          opacity: 0.9;
        }
      `}} />

      <svg width={width} height={height} viewBox="0 0 100 90">
        <defs>
          <radialGradient id="headGlow" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop offset="0%" stopColor={robotColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={robotColor} stopOpacity="0" />
          </radialGradient>
          
          <clipPath id="eyeClip">
            <circle cx="40" cy="35" r="5" />
          </clipPath>
          
          <clipPath id="eyeClip2">
            <circle cx="60" cy="35" r="5" />
          </clipPath>
          
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={robotColor} stopOpacity="0.1" />
            <stop offset="50%" stopColor={robotColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={robotColor} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Efecto de brillo detrás de la cabeza */}
        <ellipse className="robot-glow" cx="50" cy="40" rx="32" ry="27" />
        
        {/* Antena */}
        <line className="robot-antenna" x1="50" y1="15" x2="50" y2="5" />
        <circle className="robot-antenna-tip" cx="50" cy="5" r="2" />
        
        {/* Cabeza principal */}
        <g id="head">
          {/* Base de la cabeza */}
          <rect className="robot-part" x="25" y="15" width="50" height="50" rx="8" ry="8" />
          
          {/* Detalles tecnológicos */}
          <rect className="robot-chip" x="32" y="17" width="8" height="5" rx="1" />
          <line className="chip-line" x1="33" y1="19.5" x2="39" y2="19.5" />
          <line className="chip-line" x1="33" y1="20.5" x2="39" y2="20.5" />
          
          <rect className="robot-chip" x="60" y="17" width="8" height="5" rx="1" />
          <line className="chip-line" x1="61" y1="19.5" x2="67" y2="19.5" />
          <line className="chip-line" x1="61" y1="20.5" x2="67" y2="20.5" />
          
          {/* Luces de estado */}
          <circle className="status-light" cx="27" cy="18" r="1" />
          <circle className="status-light" cx="73" cy="18" r="1" />
          <circle className="status-light" cx="27" cy="62" r="1" />
          <circle className="status-light" cx="73" cy="62" r="1" />
          
          {/* Panel de control lateral */}
          <rect className="robot-panel" x="68" y="25" width="6" height="15" rx="1" />
          <line className="display-line" x1="69" y1="28" x2="73" y2="28" />
          <line className="display-line" x1="69" y1="31" x2="73" y2="31" />
          <line className="display-line" x1="69" y1="34" x2="73" y2="34" />
          <line className="display-line" x1="69" y1="37" x2="73" y2="37" />
          
          {/* Circuitos internos visibles */}
          <path className="inner-circuit" d="M 30 25 C 35 20, 40 30, 45 25" />
          <path className="inner-circuit" d="M 55 25 C 60 20, 65 30, 70 25" />
          <path className="inner-circuit" d="M 35 55 C 40 60, 45 50, 50 55" />
          <path className="inner-circuit" d="M 50 55 C 55 60, 60 50, 65 55" />
          
          {/* Ojos mejorados */}
          <circle className="robot-eye" cx="40" cy="35" r="5" />
          <circle className="robot-eye" cx="60" cy="35" r="5" />
          
          {/* Pupilas */}
          <circle className="robot-eye-pupil" cx="40" cy="35" r="2.5" />
          <circle className="robot-eye-pupil" cx="60" cy="35" r="2.5" />
          
          {/* Efecto de escaneo en los ojos */}
          <rect 
            x="35" y="30" 
            width="10" height="10" 
            fill="url(#scanGradient)" 
            clipPath="url(#eyeClip)"
            className="robot-eye-scanner" 
          />
          
          <rect 
            x="55" y="30" 
            width="10" height="10" 
            fill="url(#scanGradient)" 
            clipPath="url(#eyeClip2)"
            className="robot-eye-scanner" 
          />
          
          {/* Boca interactiva */}
          <path 
            className="robot-mouth" 
            d="M 40,50 C 46,52 54,52 60,50" 
          />
          
          {/* Detalles decorativos */}
          <path className="robot-detail" d="M 25,35 L 35,35" />
          <path className="robot-detail" d="M 65,35 L 75,35" />
          <path className="robot-detail" d="M 38,25 L 38,31" />
          <path className="robot-detail" d="M 62,25 L 62,31" />
          <path className="robot-detail-solid" d="M 46,58 L 54,58 L 54,59 L 46,59 Z" />
                    
          {/* Cigarrillo */}
          <line 
            className="cigarette" 
            x1="70" y1="50" 
            x2="85" y2="45" 
            stroke="white" 
            strokeWidth="1.5" 
          />
          
          {/* Punta del cigarrillo */}
          <circle className="cigarette-tip" cx="70" cy="50" r="2" />
          
          {/* Humo */}
          <circle className="smoke smoke-1" cx="72" cy="49" r="2" />
          <circle className="smoke smoke-2" cx="74" cy="48" r="2.2" />
          <circle className="smoke smoke-3" cx="76" cy="47" r="2.5" />
        </g>
      </svg>
    </div>
  );
};

export default RobotHead;