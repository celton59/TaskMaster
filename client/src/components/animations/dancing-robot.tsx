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
    <div className={`walking-robot-container ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .walking-robot-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          filter: drop-shadow(0 0 8px ${glowColor});
          animation: walkForward 5s linear infinite;
        }
        
        @keyframes walkForward {
          0% { transform: translateX(-5px); }
          25% { transform: translateX(0); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(0); }
          100% { transform: translateX(-5px); }
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
          animation: headWalk 1s ease-in-out infinite;
        }
        
        @keyframes headWalk {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        
        #torso {
          animation: torsoWalk 1s ease-in-out infinite;
        }
        
        @keyframes torsoWalk {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-1px) rotate(1deg); }
          75% { transform: translateY(-1px) rotate(-1deg); }
        }

        #leftArm {
          transform-origin: top center;
          animation: walkingArmLeft 1s ease-in-out infinite;
        }
        
        @keyframes walkingArmLeft {
          0%, 100% { transform: rotate(5deg); }
          50% { transform: rotate(-15deg); }
        }
        
        #rightArm {
          transform-origin: top center;
          animation: walkingArmRight 1s ease-in-out infinite;
        }
        
        @keyframes walkingArmRight {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(5deg); }
        }
        
        #leftUpperLeg {
          transform-origin: top center;
          animation: upperLegLeft 1s ease-in-out infinite;
        }
        
        @keyframes upperLegLeft {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
        
        #leftLowerLeg {
          transform-origin: top center;
          animation: lowerLegLeft 1s ease-in-out infinite;
        }
        
        @keyframes lowerLegLeft {
          0%, 100% { transform: rotate(10deg); }
          50% { transform: rotate(-5deg); }
        }
        
        #rightUpperLeg {
          transform-origin: top center;
          animation: upperLegRight 1s ease-in-out infinite;
        }
        
        @keyframes upperLegRight {
          0%, 100% { transform: rotate(15deg); }
          50% { transform: rotate(-15deg); }
        }
        
        #rightLowerLeg {
          transform-origin: top center;
          animation: lowerLegRight 1s ease-in-out infinite;
        }
        
        @keyframes lowerLegRight {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(10deg); }
        }

        #leftFoot {
          transform-origin: center left;
          animation: footLeft 1s ease-in-out infinite;
        }
        
        @keyframes footLeft {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(5deg); }
        }
        
        #rightFoot {
          transform-origin: center left;
          animation: footRight 1s ease-in-out infinite;
        }
        
        @keyframes footRight {
          0%, 100% { transform: rotate(5deg); }
          25% { transform: rotate(0deg); }
          75% { transform: rotate(-10deg); }
        }

        @keyframes eyeGlow {
          0%   { opacity: 0.7; fill: white; }
          50%  { opacity: 0.9; fill: white; }
          100% { opacity: 1; fill: ${robotColor}; }
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

      <svg width={width} height={height} viewBox="0 0 200 350">
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

        {/* Cabeza del robot */}
        <g id="head">
          <ellipse className="robot-glow" cx="100" cy="40" rx="30" ry="25" />
          <rect className="robot-part" x="75" y="15" width="50" height="50" rx="12" ry="12" />
          
          {/* Ojos */}
          <circle className="robot-eye" cx="90" cy="35" r="5" />
          <circle className="robot-eye" cx="110" cy="35" r="5" />
          
          {/* Boca pequeña */}
          <rect className="robot-detail" x="90" y="50" width="20" height="2" rx="1" />
          
          {/* Cigarrillo */}
          <line 
            className="cigarette" 
            x1="120" y1="50" 
            x2="135" y2="45" 
            stroke="white" 
            strokeWidth="2" 
          />
          
          {/* Punta del cigarrillo */}
          <circle className="cigarette-tip" cx="120" cy="50" r="2" />
          
          {/* Humo */}
          <circle className="smoke smoke-1" cx="137" cy="43" r="3" />
          <circle className="smoke smoke-2" cx="137" cy="43" r="2.5" />
          <circle className="smoke smoke-3" cx="137" cy="43" r="2" />
        </g>
        
        {/* Cuello */}
        <rect className="robot-part" x="95" y="65" width="10" height="10" rx="2" ry="2" />
        <circle className="robot-joint" cx="100" cy="65" r="4" />
        
        {/* Torso */}
        <g id="torso">
          <ellipse className="robot-glow" cx="100" cy="100" rx="35" ry="30" />
          <rect className="robot-part" x="75" y="75" width="50" height="60" rx="10" ry="10" />
          
          {/* Panel de control en el pecho */}
          <rect className="robot-panel" x="85" y="85" width="30" height="20" rx="4" />
          <circle className="robot-joint" cx="95" cy="95" r="3" />
          <circle className="robot-joint" cx="105" cy="95" r="3" />
          
          {/* Líneas de detalle */}
          <line className="robot-detail" x1="85" y1="115" x2="115" y2="115" />
          <line className="robot-detail" x1="85" y1="125" x2="115" y2="125" />
        </g>
        
        {/* Articulaciones de cadera */}
        <circle className="robot-joint" cx="85" cy="135" r="5" />
        <circle className="robot-joint" cx="115" cy="135" r="5" />
        
        {/* Brazo izquierdo */}
        <g id="leftArm">
          <ellipse className="robot-glow" cx="55" cy="100" rx="10" ry="25" />
          
          {/* Parte superior del brazo */}
          <rect className="robot-part" x="50" y="75" width="10" height="30" rx="5" ry="5" />
          <circle className="robot-joint" cx="55" cy="75" r="3" />
          
          {/* Codo */}
          <circle className="robot-joint" cx="55" cy="105" r="3" />
          
          {/* Antebrazo */}
          <rect className="robot-part" x="50" y="105" width="10" height="30" rx="5" ry="5" />
          
          {/* Muñeca */}
          <circle className="robot-joint" cx="55" cy="135" r="3" />
          
          {/* Mano */}
          <rect className="robot-part" x="50" y="135" width="10" height="8" rx="3" ry="3" />
        </g>
        
        {/* Brazo derecho */}
        <g id="rightArm">
          <ellipse className="robot-glow" cx="145" cy="100" rx="10" ry="25" />
          
          {/* Parte superior del brazo */}
          <rect className="robot-part" x="140" y="75" width="10" height="30" rx="5" ry="5" />
          <circle className="robot-joint" cx="145" cy="75" r="3" />
          
          {/* Codo */}
          <circle className="robot-joint" cx="145" cy="105" r="3" />
          
          {/* Antebrazo */}
          <rect className="robot-part" x="140" y="105" width="10" height="30" rx="5" ry="5" />
          
          {/* Muñeca */}
          <circle className="robot-joint" cx="145" cy="135" r="3" />
          
          {/* Mano */}
          <rect className="robot-part" x="140" y="135" width="10" height="8" rx="3" ry="3" />
        </g>
        
        {/* Pierna izquierda */}
        <g>
          {/* Muslo */}
          <g id="leftUpperLeg">
            <ellipse className="robot-glow" cx="85" cy="160" rx="10" ry="20" />
            <rect className="robot-part" x="80" y="135" width="10" height="40" rx="5" ry="5" />
            
            {/* Rodilla */}
            <circle className="robot-joint" cx="85" cy="175" r="4" />
            
            {/* Pantorrilla */}
            <g id="leftLowerLeg">
              <ellipse className="robot-glow" cx="85" cy="200" rx="8" ry="20" />
              <rect className="robot-part" x="80" y="175" width="10" height="40" rx="5" ry="5" />
              
              {/* Tobillo */}
              <circle className="robot-joint" cx="85" cy="215" r="3" />
              
              {/* Pie */}
              <g id="leftFoot">
                <rect className="robot-part" x="75" y="215" width="20" height="7" rx="3" ry="3" />
              </g>
            </g>
          </g>
        </g>
        
        {/* Pierna derecha */}
        <g>
          {/* Muslo */}
          <g id="rightUpperLeg">
            <ellipse className="robot-glow" cx="115" cy="160" rx="10" ry="20" />
            <rect className="robot-part" x="110" y="135" width="10" height="40" rx="5" ry="5" />
            
            {/* Rodilla */}
            <circle className="robot-joint" cx="115" cy="175" r="4" />
            
            {/* Pantorrilla */}
            <g id="rightLowerLeg">
              <ellipse className="robot-glow" cx="115" cy="200" rx="8" ry="20" />
              <rect className="robot-part" x="110" y="175" width="10" height="40" rx="5" ry="5" />
              
              {/* Tobillo */}
              <circle className="robot-joint" cx="115" cy="215" r="3" />
              
              {/* Pie */}
              <g id="rightFoot">
                <rect className="robot-part" x="105" y="215" width="20" height="7" rx="3" ry="3" />
              </g>
            </g>
          </g>
        </g>
      </svg>
      
      <div className="effect-layer"></div>
    </div>
  );
};

export default DancingRobot;