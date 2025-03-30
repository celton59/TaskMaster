import React from 'react';

interface DancingRobotProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export const DancingRobot: React.FC<DancingRobotProps> = ({ 
  width = 120, 
  height = 180,
  className = '',
  color = 'var(--neon-accent)'
}) => {
  const robotColor = color;
  const glowColor = color.includes('purple') ? 'rgba(187,0,255,0.6)' : 
                    color.includes('green') ? 'rgba(0,255,157,0.6)' : 
                    color.includes('yellow') ? 'rgba(255,234,0,0.6)' : 
                    'rgba(0,225,255,0.6)';
  
  const cigaretteGlow = 'rgba(255, 100, 50, 0.7)';
  const smokeColor = 'rgba(200, 200, 200, 0.8)';
  
  return (
    <div className={`dancing-robot-container ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .dancing-robot-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          filter: drop-shadow(0 0 8px ${glowColor});
        }
        
        .robot-part {
          fill: ${robotColor};
          stroke: rgba(0, 0, 0, 0.5);
          stroke-width: 1.5;
          filter: drop-shadow(0 0 3px ${glowColor});
        }

        .robot-panel {
          fill: rgba(20, 20, 35, 0.8);
          stroke: ${robotColor};
          stroke-width: 1;
        }

        .robot-detail {
          fill: none;
          stroke: ${robotColor};
          stroke-width: 1;
          stroke-dasharray: 3 2;
          opacity: 0.9;
        }

        .robot-glow {
          fill: ${robotColor};
          opacity: 0.15;
          filter: blur(5px);
        }

        .robot-eye {
          fill: white;
          filter: drop-shadow(0 0 2px white);
          animation: eyeGlow 1.5s infinite alternate;
        }

        .robot-antenna {
          fill: ${robotColor};
          animation: antennaFlash 0.7s infinite alternate;
        }

        .robot-joint {
          fill: rgba(50, 50, 60, 0.9);
          stroke: ${robotColor};
          stroke-width: 1;
        }

        .effect-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          opacity: 0.1;
          background: 
            linear-gradient(0deg, transparent 0%, ${glowColor} 50%, transparent 100%),
            radial-gradient(circle at center, ${glowColor} 0%, transparent 50%);
          mix-blend-mode: screen;
          animation: effectPulse 3s infinite alternate;
        }
        
        #head {
          transform-origin: center bottom;
          animation: headNod 2s ease-in-out infinite alternate;
        }
        
        @keyframes headNod {
          0%   { transform: rotate(8deg); }
          25%  { transform: rotate(0deg); }
          75%  { transform: rotate(0deg); }
          100% { transform: rotate(-8deg); }
        }
        
        #leftArm {
          transform-origin: top right;
          animation: leftArmSwing 1.2s ease-in-out infinite alternate;
        }
        
        @keyframes leftArmSwing {
          0%   { transform: rotate(25deg); }
          50%  { transform: rotate(10deg); }
          100% { transform: rotate(-15deg); }
        }
        
        #rightArm {
          transform-origin: top left;
          animation: rightArmSwing 1.1s ease-in-out infinite alternate;
        }
        
        @keyframes rightArmSwing {
          0%   { transform: rotate(-25deg); }
          45%  { transform: rotate(-10deg); }
          100% { transform: rotate(15deg); }
        }
        
        #leftLeg {
          transform-origin: top center;
          animation: leftLegSwing 1.3s ease-in-out infinite alternate;
        }
        
        @keyframes leftLegSwing {
          0%   { transform: rotate(15deg); }
          50%  { transform: rotate(5deg); }
          100% { transform: rotate(-10deg); }
        }
        
        #rightLeg {
          transform-origin: top center;
          animation: rightLegSwing 1.35s ease-in-out infinite alternate;
        }
        
        @keyframes rightLegSwing {
          0%   { transform: rotate(-15deg); }
          50%  { transform: rotate(-5deg); }
          100% { transform: rotate(10deg); }
        }

        @keyframes eyeGlow {
          0%   { opacity: 0.7; fill: white; }
          50%  { opacity: 0.9; fill: white; }
          100% { opacity: 1; fill: ${robotColor}; }
        }

        @keyframes antennaFlash {
          0%   { opacity: 0.7; }
          100% { opacity: 1; }
        }

        @keyframes effectPulse {
          0%   { opacity: 0.05; }
          50%  { opacity: 0.12; }
          100% { opacity: 0.08; }
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
            opacity: 0.8;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translate(0, -30px) scale(1.5);
            opacity: 0;
          }
        }
      `}} />

      <svg width={width} height={height} viewBox="0 0 250 350">
        {/* Efectos de fondo */}
        <defs>
          <radialGradient id="headGlow" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop offset="0%" stopColor={robotColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={robotColor} stopOpacity="0" />
          </radialGradient>
          
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Cuerpo del robot */}
        <g id="body">
          <ellipse className="robot-glow" cx="125" cy="170" rx="45" ry="55" />
          <rect className="robot-part" x="85" y="120" width="80" height="100" rx="15" ry="15" />
          
          {/* Panel de control en el cuerpo */}
          <rect className="robot-panel" x="100" y="135" width="50" height="25" rx="5" />
          <circle className="robot-joint" cx="110" cy="147" r="5" />
          <circle className="robot-joint" cx="125" cy="147" r="5" />
          <circle className="robot-joint" cx="140" cy="147" r="5" />
          
          {/* Líneas de detalle */}
          <line className="robot-detail" x1="100" y1="175" x2="150" y2="175" />
          <line className="robot-detail" x1="100" y1="185" x2="150" y2="185" />
          <line className="robot-detail" x1="100" y1="195" x2="150" y2="195" />
        </g>
        
        {/* Cabeza del robot */}
        <g id="head">
          <ellipse className="robot-glow" cx="125" cy="90" rx="35" ry="30" />
          <rect className="robot-part" x="95" y="60" width="60" height="60" rx="15" ry="15" />
          
          {/* Ojos */}
          <circle className="robot-eye" cx="110" cy="80" r="5" />
          <circle className="robot-eye" cx="140" cy="80" r="5" />
          
          {/* Boca pequeña */}
          <rect className="robot-detail" x="115" y="100" width="20" height="2" rx="1" />
          
          {/* Cigarrillo */}
          <line 
            className="cigarette" 
            x1="145" y1="100" 
            x2="165" y2="90" 
            stroke="white" 
            strokeWidth="2" 
          />
          
          {/* Punta del cigarrillo */}
          <circle className="cigarette-tip" cx="145" cy="100" r="2" />
          
          {/* Humo */}
          <circle className="smoke smoke-1" cx="167" cy="88" r="4" />
          <circle className="smoke smoke-2" cx="167" cy="88" r="3" />
          <circle className="smoke smoke-3" cx="167" cy="88" r="2" />
        </g>
        
        {/* Brazos */}
        <g id="leftArm">
          <ellipse className="robot-glow" cx="67" cy="160" rx="15" ry="35" />
          <rect className="robot-part" x="65" y="130" width="15" height="60" rx="7" ry="7" />
          <circle className="robot-joint" cx="72" cy="130" r="5" />
          <circle className="robot-joint" cx="72" cy="190" r="5" />
        </g>
        
        <g id="rightArm">
          <ellipse className="robot-glow" cx="183" cy="160" rx="15" ry="35" />
          <rect className="robot-part" x="175" y="130" width="15" height="60" rx="7" ry="7" />
          <circle className="robot-joint" cx="182" cy="130" r="5" />
          <circle className="robot-joint" cx="182" cy="190" r="5" />
        </g>
        
        {/* Piernas */}
        <g id="leftLeg">
          <ellipse className="robot-glow" cx="105" cy="250" rx="12" ry="35" />
          <rect className="robot-part" x="95" y="220" width="20" height="60" rx="8" ry="8" />
          <circle className="robot-joint" cx="105" cy="220" r="4" />
          <rect className="robot-panel" x="97" y="260" width="16" height="10" rx="3" />
        </g>
        
        <g id="rightLeg">
          <ellipse className="robot-glow" cx="145" cy="250" rx="12" ry="35" />
          <rect className="robot-part" x="135" y="220" width="20" height="60" rx="8" ry="8" />
          <circle className="robot-joint" cx="145" cy="220" r="4" />
          <rect className="robot-panel" x="137" y="260" width="16" height="10" rx="3" />
        </g>
      </svg>
      
      <div className="effect-layer"></div>
    </div>
  );
};

export default DancingRobot;