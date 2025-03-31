import { useEffect, useRef } from "react";
import gsap from "gsap";

export function RobotAnimation() {
  const robotRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!robotRef.current) return;

    // --- Definir Orígenes de Transformación ---
    gsap.set("#cabeza", { transformOrigin: "50% 100%" }); // Base del cuello
    gsap.set("#brazo_derecho, #brazo_izquierdo", { transformOrigin: "50% 0%" }); // Hombros
    gsap.set("#antebrazo_der, #antebrazo_izq", { transformOrigin: "50% 0%" }); // Codos
    gsap.set("#pierna_derecha, #pierna_izquierda", { transformOrigin: "50% 0%" }); // Caderas
    gsap.set("#pierna_inf_der, #pierna_inf_izq", { transformOrigin: "50% 0%" }); // Rodillas
    gsap.set(["#humo1", "#humo2", "#humo3"], { transformOrigin: "center center", scale: 0 }); // Humo empieza escalado a 0
    gsap.set("#ojo", { transformOrigin: "center center" }); // Ojo para animación de parpadeo
    gsap.set("#antena_luz", { transformOrigin: "50% 100%" }); // Luz de la antena

    // --- Tilemine principal ---
    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: "power1.inOut" }
    });

    // --- Efectos especiales simultáneos ---
    
    // Pulso de todo el robot
    gsap.to("#robot", {
      scale: 1.02,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // Parpadeo del ojo
    gsap.to("#ojo", {
      scaleY: 0.2,
      duration: 0.1,
      repeat: -1,
      repeatDelay: 3.5,
      yoyo: true,
      ease: "power4.out"
    });
    
    // Pulso de luz del ojo
    gsap.to("#ojo_brillo", {
      opacity: 0.7,
      duration: 1.2,
      repeat: -1,
      yoyo: true
    });
    
    // Pulso de brillo en las partes principales
    gsap.to(".robot-glow", {
      filter: "drop-shadow(0 0 8px #14ecff)",
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // Animación de la luz de la antena
    gsap.to("#antena_luz", {
      opacity: 0.6,
      scale: 1.3,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    const stepDuration = 0.6; // Duración más rápida

    // --- Animación del Ciclo de Caminar (mejorada) ---
    
    // Paso 1: Pierna Derecha Adelante, Izquierda Atrás
    tl.to("#robot", { y: "+=2", duration: stepDuration / 2, yoyo: true, repeat: 1 }, 0)
      .to("#pierna_derecha", { rotation: 25, duration: stepDuration, ease: "power2.inOut" }, 0)
      .to("#pierna_inf_der", { rotation: 5, duration: stepDuration, ease: "power1.inOut" }, 0)
      .to("#pierna_izquierda", { rotation: -25, duration: stepDuration, ease: "power2.inOut" }, 0)
      .to("#pierna_inf_izq", { rotation: 30, duration: stepDuration, ease: "power1.inOut" }, 0)
      .to("#brazo_derecho", { rotation: -30, duration: stepDuration, ease: "sine.inOut" }, 0)
      .to("#antebrazo_der", { rotation: 15, duration: stepDuration, ease: "sine.inOut" }, 0)
      .to("#brazo_izquierdo", { rotation: 30, duration: stepDuration, ease: "sine.inOut" }, 0)
      .to("#antebrazo_izq", { rotation: 10, duration: stepDuration, ease: "sine.inOut" }, 0)
      .to("#cabeza", { rotation: 2, duration: stepDuration / 2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0)
      .to("#torso", { rotation: 1, duration: stepDuration, ease: "sine.inOut" }, 0); // Ligera rotación del torso

    // Paso 2: Pierna Izquierda Adelante, Derecha Atrás
    tl.to("#robot", { y: "+=2", duration: stepDuration / 2, yoyo: true, repeat: 1 }, stepDuration)
      .to("#pierna_derecha", { rotation: -25, duration: stepDuration, ease: "power2.inOut" }, stepDuration)
      .to("#pierna_inf_der", { rotation: 30, duration: stepDuration, ease: "power1.inOut" }, stepDuration)
      .to("#pierna_izquierda", { rotation: 25, duration: stepDuration, ease: "power2.inOut" }, stepDuration)
      .to("#pierna_inf_izq", { rotation: 5, duration: stepDuration, ease: "power1.inOut" }, stepDuration)
      .to("#brazo_derecho", { rotation: 30, duration: stepDuration, ease: "sine.inOut" }, stepDuration)
      .to("#antebrazo_der", { rotation: 10, duration: stepDuration, ease: "sine.inOut" }, stepDuration)
      .to("#brazo_izquierdo", { rotation: -30, duration: stepDuration, ease: "sine.inOut" }, stepDuration)
      .to("#antebrazo_izq", { rotation: 15, duration: stepDuration, ease: "sine.inOut" }, stepDuration)
      .to("#cabeza", { rotation: -2, duration: stepDuration / 2, yoyo: true, repeat: 1, ease: "sine.inOut" }, stepDuration)
      .to("#torso", { rotation: -1, duration: stepDuration, ease: "sine.inOut" }, stepDuration);

    // --- Animación de Fumar (mejorada) ---
    const smokeStartTime = stepDuration * 4.5; // Empezar a fumar después de más ciclos de caminar
    const smokeDuration = stepDuration * 2; // Duración más larga de la acción de fumar

    tl.addLabel("startSmoking", smokeStartTime)
      // Mover brazo a la boca
      .to("#brazo_derecho", {
        rotation: -85,
        duration: smokeDuration * 0.3,
        ease: "back.out(1.2)" // Efecto con rebote ligero
      }, "startSmoking")
      .to("#antebrazo_der", {
        rotation: 95,
        duration: smokeDuration * 0.3,
        ease: "back.out(1.2)"
      }, "startSmoking")
      
      // Hacer brillar el cigarrillo
      .to("#cigarrillo_punta", {
        fill: "#ff5e00",
        scale: 1.5,
        filter: "drop-shadow(0 0 3px #ff3e00)",
        duration: smokeDuration * 0.1,
      }, "startSmoking+=0.3")
      
      // Pausa en la boca y animación del humo (mejorada)
      .addLabel("puff", "startSmoking+=0.4")
      
      // Primera nube de humo
      .to("#humo1", {
        opacity: 0.9,
        scale: 1.2,
        duration: smokeDuration * 0.1
      }, "puff")
      .to("#humo1", {
        y: "-=25",
        x: "+=15", 
        scale: 2.8,
        opacity: 0,
        rotation: 15,
        duration: smokeDuration * 0.7,
        ease: "sine.out"
      }, "puff+=0.1")
      
      // Segunda nube de humo (ligeramente después)
      .to("#humo2", {
        opacity: 0.8,
        scale: 1,
        duration: smokeDuration * 0.1
      }, "puff+=0.2")
      .to("#humo2", {
        y: "-=20",
        x: "+=8",
        scale: 2.2,
        opacity: 0,
        rotation: -10,
        duration: smokeDuration * 0.65,
        ease: "sine.out"
      }, "puff+=0.3")
      
      // Tercera nube de humo
      .to("#humo3", {
        opacity: 0.7,
        scale: 0.8,
        duration: smokeDuration * 0.1
      }, "puff+=0.35")
      .to("#humo3", {
        y: "-=30",
        x: "+=5",
        scale: 2.5,
        opacity: 0,
        rotation: 5,
        duration: smokeDuration * 0.6,
        ease: "sine.out"
      }, "puff+=0.45")
      
      // Resetear humo para la próxima vez
      .set(["#humo1", "#humo2", "#humo3"], {
        opacity: 0,
        scale: 0,
        x: 0,
        y: 0,
        rotation: 0
      }, "puff+=1.1")
      
      // Apagar el brillo del cigarrillo
      .to("#cigarrillo_punta", {
        fill: "#ff3e00",
        scale: 1,
        filter: "none",
        duration: smokeDuration * 0.3,
      }, "puff+=0.5")
      
      // Bajar el brazo (con rebote natural)
      .to("#brazo_derecho", {
        rotation: 15,
        duration: smokeDuration * 0.4,
        ease: "back.out(1.4)"
      }, "puff+=0.8")
      .to("#antebrazo_der", {
        rotation: 5,
        duration: smokeDuration * 0.4,
        ease: "back.out(1.4)"
      }, "puff+=0.8");

    return () => {
      // Limpieza
      gsap.killTweensOf("#robot, #cabeza, #brazo_derecho, #brazo_izquierdo, #antebrazo_der, #antebrazo_izq, #pierna_derecha, #pierna_izquierda, #pierna_inf_der, #pierna_inf_izq, #torso, #ojo, #ojo_brillo, #antena_luz, #humo1, #humo2, #humo3, #cigarrillo_punta, .robot-glow");
      tl.kill();
    };
  }, []);

  return (
    <div className="robot-container">
      <svg ref={robotRef} viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Definiciones para efectos de brillo */}
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#14ecff" stopOpacity="1" />
            <stop offset="100%" stopColor="#14ecff" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2cc8e0" />
            <stop offset="50%" stopColor="#20aed4" />
            <stop offset="100%" stopColor="#178ca8" />
          </linearGradient>
        </defs>
        
        {/* Efectos de fondo */}
        <circle cx="60" cy="90" r="40" fill="url(#eyeGlow)" opacity="0.15" />
        
        <g id="robot" transform="translate(60, 90)">
          {/* Antena */}
          <line x1="0" y1="-67" x2="0" y2="-75" stroke="#0c5970" strokeWidth="1.5" />
          <circle id="antena_luz" cx="0" cy="-75" r="2" fill="#14ecff" className="robot-glow" />
          
          {/* Torso mejorado con detalles */}
          <g id="torso">
            <rect x="-15" y="-45" width="30" height="60" rx="4" ry="4" className="robot-part robot-body robot-glow" />
            
            {/* Detalles del torso */}
            <rect x="-10" y="-40" width="20" height="5" rx="1" ry="1" fill="#0c5970" opacity="0.7" />
            <circle cx="0" cy="-30" r="3" fill="#0c5970" opacity="0.7" />
            <rect x="-8" y="-20" width="16" height="3" rx="1" ry="1" fill="#0c5970" opacity="0.7" />
            <rect x="-8" y="-15" width="16" height="3" rx="1" ry="1" fill="#0c5970" opacity="0.7" />
            <rect x="-8" y="-10" width="16" height="3" rx="1" ry="1" fill="#0c5970" opacity="0.7" />
            
            {/* Brillo central */}
            <circle cx="0" cy="-30" r="2" fill="#14ecff" opacity="0.7" className="robot-glow" />
          </g>
          
          {/* Cabeza mejorada */}
          <g id="cabeza" transform="translate(0, -55)">
            <rect x="-10" y="-10" width="20" height="20" rx="3" ry="3" className="robot-part robot-joints robot-glow" />
            
            {/* Ojo con brillo */}
            <g id="ojo">
              <circle cx="5" cy="0" r="3.5" fill="#0a3a48" />
              <circle cx="5" cy="0" r="2.5" fill="#14ecff" className="robot-glow" />
              <circle id="ojo_brillo" cx="5" cy="0" r="4" fill="url(#eyeGlow)" opacity="0.6" />
            </g>
            
            {/* Detalles de la cara */}
            <line x1="-5" y1="-5" x2="-3" y2="-5" stroke="#0c5970" strokeWidth="1.5" />
            <line x1="-5" y1="-3" x2="-2" y2="-3" stroke="#0c5970" strokeWidth="1.5" />
            <rect x="-7" y="3" width="8" height="2" rx="1" ry="1" fill="#0c5970" />
          </g>

          {/* Brazo derecho mejorado */}
          <g id="brazo_derecho" transform="translate(25, -40)">
            <rect id="brazo_sup_der" x="-4" y="0" width="8" height="35" rx="2" ry="2" className="robot-part robot-limbs" />
            <g id="antebrazo_der" transform="translate(0, 35)">
              <rect x="-3" y="0" width="6" height="30" rx="2" ry="2" className="robot-part robot-joints" />
              <g id="mano_der" transform="translate(0, 30)">
                <rect x="-4" y="0" width="8" height="8" rx="1" ry="1" className="robot-part robot-limbs" />
                
                {/* Cigarrillo mejorado */}
                <rect id="cigarrillo" x="4" y="2" width="2" height="10" fill="white" stroke="#444" strokeWidth="0.5" />
                <circle id="cigarrillo_punta" cx="5" cy="12" r="1.2" fill="#ff3e00" />
                
                {/* Articulaciones de los dedos */}
                <line x1="-2" y1="2" x2="-2" y2="6" stroke="#0c5970" strokeWidth="0.8" />
                <line x1="0" y1="2" x2="0" y2="6" stroke="#0c5970" strokeWidth="0.8" />
              </g>
            </g>
          </g>

          {/* Brazo izquierdo mejorado */}
          <g id="brazo_izquierdo" transform="translate(-25, -40)">
            <rect id="brazo_sup_izq" x="-4" y="0" width="8" height="35" rx="2" ry="2" className="robot-part robot-limbs" />
            <g id="antebrazo_izq" transform="translate(0, 35)">
              <rect x="-3" y="0" width="6" height="30" rx="2" ry="2" className="robot-part robot-joints" />
              <g id="mano_izq" transform="translate(0, 30)">
                <rect x="-4" y="0" width="8" height="8" rx="1" ry="1" className="robot-part robot-limbs" />
                
                {/* Articulaciones de los dedos */}
                <line x1="-2" y1="2" x2="-2" y2="6" stroke="#0c5970" strokeWidth="0.8" />
                <line x1="0" y1="2" x2="0" y2="6" stroke="#0c5970" strokeWidth="0.8" />
                <line x1="2" y1="2" x2="2" y2="6" stroke="#0c5970" strokeWidth="0.8" />
              </g>
            </g>
          </g>

          {/* Pierna derecha mejorada */}
          <g id="pierna_derecha" transform="translate(10, 15)">
            <rect id="muslo_der" x="-5" y="0" width="10" height="40" rx="2" ry="2" className="robot-part robot-limbs" />
            <g id="pierna_inf_der" transform="translate(0, 40)">
              <rect x="-4" y="0" width="8" height="35" rx="2" ry="2" className="robot-part robot-joints" />
              <g id="pie_der" transform="translate(0, 35)">
                <rect x="-7" y="0" width="14" height="8" rx="2" ry="2" className="robot-part robot-limbs" />
                
                {/* Detalles del pie */}
                <rect x="3" y="0" width="3" height="5" rx="1" ry="1" fill="#0c5970" opacity="0.7" />
              </g>
            </g>
          </g>

          {/* Pierna izquierda mejorada */}
          <g id="pierna_izquierda" transform="translate(-10, 15)">
            <rect id="muslo_izq" x="-5" y="0" width="10" height="40" rx="2" ry="2" className="robot-part robot-limbs" />
            <g id="pierna_inf_izq" transform="translate(0, 40)">
              <rect x="-4" y="0" width="8" height="35" rx="2" ry="2" className="robot-part robot-joints" />
              <g id="pie_izq" transform="translate(0, 35)">
                <rect x="-7" y="0" width="14" height="8" rx="2" ry="2" className="robot-part robot-limbs" />
                
                {/* Detalles del pie */}
                <rect x="3" y="0" width="3" height="5" rx="1" ry="1" fill="#0c5970" opacity="0.7" />
              </g>
            </g>
          </g>

          {/* Tres nubes de humo (para efecto más complejo) */}
          <g transform="translate(20, -88)">
            <circle id="humo1" cx="0" cy="0" r="5" fill="rgba(220, 220, 220, 0.8)" opacity="0" />
            <circle id="humo2" cx="-2" cy="-3" r="4" fill="rgba(210, 210, 210, 0.7)" opacity="0" />
            <circle id="humo3" cx="2" cy="-5" r="3" fill="rgba(200, 200, 200, 0.6)" opacity="0" />
          </g>
        </g>
      </svg>

      <style>
        {`
          .robot-container {
            width: 300px;
            height: 400px;
            overflow: visible;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          /* Estilos base del robot */
          .robot-part {
            stroke: #222;
            stroke-width: 1.5;
          }
          
          .robot-body { 
            fill: url(#metalGradient); 
            filter: drop-shadow(0 0 7px #20aed4);
          }
          
          .robot-limbs { 
            fill: #117c99;
          }
          
          .robot-joints { 
            fill: #0c5970; 
          }

          .robot-glow {
            filter: drop-shadow(0 0 4px #14ecff);
          }

          @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
          }
          
          @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  );
}