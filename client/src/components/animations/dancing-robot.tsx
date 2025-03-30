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
        
        #robot {
          animation: robotWalk 2s ease-in-out infinite;
        }
        
        @keyframes robotWalk {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        
        #head {
          transform-origin: center bottom;
          animation: headBob 2s ease-in-out infinite;
        }
        
        @keyframes headBob {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          75% { transform: rotate(-2deg); }
        }
        
        #leftArmGroup {
          animation: leftArmMove 2s ease-in-out infinite;
        }
        
        @keyframes leftArmMove {
          0% { transform: rotate(20deg); }
          50% { transform: rotate(-15deg); }
          100% { transform: rotate(20deg); }
        }
        
        #leftElbow {
          transform-origin: center;
          animation: leftElbowBend 2s ease-in-out infinite;
        }
        
        @keyframes leftElbowBend {
          0% { transform: rotate(-10deg); }
          50% { transform: rotate(15deg); }
          100% { transform: rotate(-10deg); }
        }
        
        #rightArmGroup {
          animation: rightArmMove 2s ease-in-out infinite;
        }
        
        @keyframes rightArmMove {
          0% { transform: rotate(-15deg); }
          50% { transform: rotate(20deg); }
          100% { transform: rotate(-15deg); }
        }
        
        #rightElbow {
          transform-origin: center;
          animation: rightElbowBend 2s ease-in-out infinite;
        }
        
        @keyframes rightElbowBend {
          0% { transform: rotate(15deg); }
          50% { transform: rotate(-10deg); }
          100% { transform: rotate(15deg); }
        }
        
        #hips {
          animation: hipRotate 2s ease-in-out infinite;
        }
        
        @keyframes hipRotate {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        
        #leftLegGroup {
          animation: leftLegStride 2s ease-in-out infinite;
        }
        
        @keyframes leftLegStride {
          0% { transform: rotate(25deg); }
          25% { transform: rotate(15deg); }
          50% { transform: rotate(-20deg); }
          75% { transform: rotate(-10deg); }
          100% { transform: rotate(25deg); }
        }
        
        #leftKnee {
          transform-origin: center;
          animation: leftKneeBend 2s ease-in-out infinite;
        }
        
        @keyframes leftKneeBend {
          0% { transform: rotate(-25deg); }
          25% { transform: rotate(-40deg); }
          50% { transform: rotate(-5deg); }
          75% { transform: rotate(0deg); }
          100% { transform: rotate(-25deg); }
        }
        
        #leftAnkle {
          transform-origin: center;
          animation: leftAnkleFlex 2s ease-in-out infinite;
        }
        
        @keyframes leftAnkleFlex {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          50% { transform: rotate(15deg); }
          75% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        
        #rightLegGroup {
          animation: rightLegStride 2s ease-in-out infinite;
        }
        
        @keyframes rightLegStride {
          0% { transform: rotate(-20deg); }
          25% { transform: rotate(-10deg); }
          50% { transform: rotate(25deg); }
          75% { transform: rotate(15deg); }
          100% { transform: rotate(-20deg); }
        }
        
        #rightKnee {
          transform-origin: center;
          animation: rightKneeBend 2s ease-in-out infinite;
        }
        
        @keyframes rightKneeBend {
          0% { transform: rotate(-5deg); }
          25% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
          75% { transform: rotate(-40deg); }
          100% { transform: rotate(-5deg); }
        }
        
        #rightAnkle {
          transform-origin: center;
          animation: rightAnkleFlex 2s ease-in-out infinite;
        }
        
        @keyframes rightAnkleFlex {
          0% { transform: rotate(15deg); }
          25% { transform: rotate(0deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(5deg); }
          100% { transform: rotate(15deg); }
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

        <g id="robot">
          {/* Cabeza */}
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
          
          {/* Cadera y pelvis */}
          <g id="hips">
            <circle className="robot-joint" cx="85" cy="135" r="5" />
            <circle className="robot-joint" cx="115" cy="135" r="5" />
            <rect className="robot-panel" x="85" y="130" width="30" height="10" rx="3" ry="3" />
          </g>
          
          {/* Brazo izquierdo */}
          <g id="leftArmGroup">
            <ellipse className="robot-glow" cx="55" cy="100" rx="10" ry="25" />
            
            {/* Hombro y parte superior del brazo */}
            <circle className="robot-joint" cx="75" cy="80" r="5" /> 
            <rect className="robot-part" x="45" y="80" width="30" height="10" rx="5" ry="5" />
            
            {/* Grupo de codo y antebrazo */}
            <g id="leftElbow">
              <circle className="robot-joint" cx="45" cy="90" r="4" />
              <rect className="robot-part" x="40" y="90" width="10" height="40" rx="5" ry="5" />
              
              {/* Muñeca y mano */}
              <circle className="robot-joint" cx="45" cy="130" r="3" />
              <rect className="robot-part" x="35" y="130" width="18" height="8" rx="4" ry="4" />
            </g>
          </g>
          
          {/* Brazo derecho */}
          <g id="rightArmGroup">
            <ellipse className="robot-glow" cx="145" cy="100" rx="10" ry="25" />
            
            {/* Hombro y parte superior del brazo */}
            <circle className="robot-joint" cx="125" cy="80" r="5" />
            <rect className="robot-part" x="125" y="80" width="30" height="10" rx="5" ry="5" />
            
            {/* Grupo de codo y antebrazo */}
            <g id="rightElbow">
              <circle className="robot-joint" cx="155" cy="90" r="4" />
              <rect className="robot-part" x="150" y="90" width="10" height="40" rx="5" ry="5" />
              
              {/* Muñeca y mano */}
              <circle className="robot-joint" cx="155" cy="130" r="3" />
              <rect className="robot-part" x="147" y="130" width="18" height="8" rx="4" ry="4" />
            </g>
          </g>
          
          {/* Pierna izquierda */}
          <g id="leftLegGroup">
            <ellipse className="robot-glow" cx="85" cy="160" rx="10" ry="30" />
            
            {/* Muslo */}
            <rect className="robot-part" x="80" y="140" width="10" height="40" rx="5" ry="5" />
            
            {/* Rodilla y grupo de pantorrilla */}
            <g id="leftKnee">
              <circle className="robot-joint" cx="85" cy="180" r="5" />
              <rect className="robot-part" x="80" y="180" width="10" height="45" rx="5" ry="5" />
              
              {/* Tobillo y pie */}
              <g id="leftAnkle">
                <circle className="robot-joint" cx="85" cy="225" r="4" />
                <rect className="robot-part" x="70" y="225" width="25" height="8" rx="4" ry="4" />
              </g>
            </g>
          </g>
          
          {/* Pierna derecha */}
          <g id="rightLegGroup">
            <ellipse className="robot-glow" cx="115" cy="160" rx="10" ry="30" />
            
            {/* Muslo */}
            <rect className="robot-part" x="110" y="140" width="10" height="40" rx="5" ry="5" />
            
            {/* Rodilla y grupo de pantorrilla */}
            <g id="rightKnee">
              <circle className="robot-joint" cx="115" cy="180" r="5" />
              <rect className="robot-part" x="110" y="180" width="10" height="45" rx="5" ry="5" />
              
              {/* Tobillo y pie */}
              <g id="rightAnkle">
                <circle className="robot-joint" cx="115" cy="225" r="4" />
                <rect className="robot-part" x="105" y="225" width="25" height="8" rx="4" ry="4" />
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