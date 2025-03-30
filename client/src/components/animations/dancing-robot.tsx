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

        .scanner-line {
          stroke: ${robotColor};
          stroke-width: 1;
          stroke-dasharray: 3 3;
          opacity: 0.7;
          animation: scannerMove 2s linear infinite;
        }

        @keyframes scannerMove {
          0%   { transform: translateY(0); opacity: 0; }
          10%  { opacity: 0.8; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(60px); opacity: 0; }
        }
      `}} />

      <svg width={width} height={height} viewBox="0 0 200 300">
        {/* Efectos de fondo */}
        <defs>
          <radialGradient id="headGlow" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop offset="0%" stopColor={robotColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={robotColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Antena */}
        <circle className="robot-antenna" cx="100" cy="30" r="4" />
        <line x1="100" y1="34" x2="100" y2="40" stroke={robotColor} strokeWidth="2" />
        
        {/* Cabeza del robot */}
        <g id="head">
          <ellipse className="robot-glow" cx="100" cy="70" rx="35" ry="30" />
          <rect className="robot-part" x="70" y="40" width="60" height="60" rx="15" ry="15" />
          <rect className="robot-panel" x="80" y="50" width="40" height="15" rx="3" />
          <line className="scanner-line" x1="80" y1="60" x2="120" y2="60" />
          
          {/* Ojos */}
          <circle className="robot-eye" cx="85" cy="75" r="6" />
          <circle className="robot-eye" cx="115" cy="75" r="6" />
          
          {/* Detalles de la cabeza */}
          <rect className="robot-detail" x="90" y="90" width="20" height="5" rx="2" />
          <circle className="robot-joint" cx="75" cy="40" r="3" />
          <circle className="robot-joint" cx="125" cy="40" r="3" />
        </g>
        
        {/* Cuerpo del robot */}
        <g id="body">
          <ellipse className="robot-glow" cx="100" cy="150" rx="45" ry="55" />
          <rect className="robot-part" x="60" y="100" width="80" height="100" rx="15" ry="15" />
          
          {/* Panel de control en el cuerpo */}
          <rect className="robot-panel" x="75" y="115" width="50" height="30" rx="5" />
          <circle className="robot-joint" cx="85" cy="130" r="5" />
          <circle className="robot-joint" cx="100" cy="130" r="5" />
          <circle className="robot-joint" cx="115" cy="130" r="5" />
          
          {/* Líneas de detalle */}
          <line className="robot-detail" x1="75" y1="160" x2="125" y2="160" />
          <line className="robot-detail" x1="75" y1="170" x2="125" y2="170" />
          <line className="robot-detail" x1="75" y1="180" x2="125" y2="180" />
        </g>
        
        {/* Brazos */}
        <g id="leftArm">
          <ellipse className="robot-glow" cx="47" cy="140" rx="15" ry="35" />
          <rect className="robot-part" x="40" y="110" width="15" height="60" rx="7" ry="7" />
          <circle className="robot-joint" cx="47" cy="110" r="5" />
          <circle className="robot-joint" cx="47" cy="170" r="5" />
        </g>
        
        <g id="rightArm">
          <ellipse className="robot-glow" cx="153" cy="140" rx="15" ry="35" />
          <rect className="robot-part" x="145" y="110" width="15" height="60" rx="7" ry="7" />
          <circle className="robot-joint" cx="153" cy="110" r="5" />
          <circle className="robot-joint" cx="153" cy="170" r="5" />
        </g>
        
        {/* Piernas */}
        <g id="leftLeg">
          <ellipse className="robot-glow" cx="85" cy="230" rx="12" ry="35" />
          <rect className="robot-part" x="75" y="200" width="20" height="60" rx="8" ry="8" />
          <circle className="robot-joint" cx="85" cy="200" r="5" />
          <rect className="robot-panel" x="77" y="240" width="16" height="10" rx="3" />
        </g>
        
        <g id="rightLeg">
          <ellipse className="robot-glow" cx="115" cy="230" rx="12" ry="35" />
          <rect className="robot-part" x="105" y="200" width="20" height="60" rx="8" ry="8" />
          <circle className="robot-joint" cx="115" cy="200" r="5" />
          <rect className="robot-panel" x="107" y="240" width="16" height="10" rx="3" />
        </g>
      </svg>
      
      <div className="effect-layer"></div>
    </div>
  );
};

export default DancingRobot;