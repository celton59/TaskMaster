import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

interface ChartData {
  name: string;
  completed: number;
  created: number;
}

interface TaskChartProps {
  data: ChartData[];
}

// Componente personalizado para renderizar dots animados
const AnimatedDot = (props: any) => {
  // Filtrar solo las propiedades que necesitamos y que son válidas para elementos SVG
  const { cx, cy, fill, stroke, index } = props;
  const pulseRef = useRef<number>();
  const [pulseSize, setPulseSize] = useState(4);
  
  useEffect(() => {
    const randomOffset = Math.random() * 1000;
    pulseRef.current = window.setInterval(() => {
      setPulseSize(size => (size === 4 ? 6 : 4));
    }, 1500 + randomOffset);
    
    return () => {
      if (pulseRef.current) {
        clearInterval(pulseRef.current);
      }
    };
  }, []);
  
  return (
    <g>
      <circle 
        cx={cx} 
        cy={cy} 
        r={pulseSize} 
        fill={fill} 
        stroke={stroke}
        strokeWidth={2}
        style={{
          transition: "r 0.8s ease-in-out",
          filter: `drop-shadow(0 0 ${2 + pulseSize/2}px ${fill})`
        }}
      />
    </g>
  );
};

// Componente personalizado para renderizar dots animados activos
const AnimatedActiveDot = (props: any) => {
  // Solo extraemos las propiedades que necesitamos para SVG
  const { cx, cy, stroke, fill } = props;
  
  return (
    <g>
      <circle 
        cx={cx} 
        cy={cy} 
        r={8} 
        fill={fill} 
        stroke={stroke} 
        strokeWidth={2}
      />
      <circle 
        cx={cx} 
        cy={cy} 
        r={12} 
        fill="transparent" 
        stroke={fill}
        strokeWidth={1}
        opacity={0.6}
        style={{
          animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"
        }}
      />
    </g>
  );
};

export function TaskChart({ data }: TaskChartProps) {
  // Agregar puntos intermedios para hacer la animación más suave
  const enhancedData = data.map((item, index) => {
    // Añadir un valor calculado para el efecto de "vida"
    return {
      ...item,
      completedPulse: item.completed + Math.random() * 0.2 - 0.1,
      createdPulse: item.created + Math.random() * 0.2 - 0.1,
    };
  });

  return (
    <div className="w-full">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={enhancedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              {/* Gradiente mejorado para tareas completadas (azul neon) */}
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(0, 225, 255, 0.9)" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="rgba(0, 195, 255, 0.4)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="rgba(0, 225, 255, 0.05)" stopOpacity={0.1}/>
              </linearGradient>
              
              {/* Gradiente mejorado para tareas creadas (purpura neon) */}
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(187, 0, 255, 0.7)" stopOpacity={0.7}/>
                <stop offset="50%" stopColor="rgba(187, 0, 255, 0.3)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="rgba(187, 0, 255, 0.05)" stopOpacity={0.05}/>
              </linearGradient>
              
              {/* Filtro de brillo mejorado */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              
              {/* Patrón de scanner futurista */}
              <pattern id="scanline" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(0, 255, 255, 0.1)" strokeWidth="2" />
              </pattern>
              
              {/* Filtro para efecto holográfico */}
              <filter id="holographic" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: 'rgba(237, 248, 255, 0.8)' }}
              axisLine={{ stroke: 'rgba(0, 225, 255, 0.3)' }}
              tickLine={{ stroke: 'rgba(0, 225, 255, 0.3)' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'rgba(237, 248, 255, 0.8)' }} 
              axisLine={{ stroke: 'rgba(0, 225, 255, 0.3)' }}
              tickLine={{ stroke: 'rgba(0, 225, 255, 0.3)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(5, 25, 35, 0.9)',
                borderColor: 'rgba(0, 225, 255, 0.5)',
                color: 'rgba(237, 248, 255, 0.9)',
                boxShadow: '0 0 10px rgba(0, 225, 255, 0.3)',
                borderRadius: '8px',
                fontFamily: 'monospace'
              }}
              itemStyle={{ color: 'rgba(237, 248, 255, 0.9)' }}
              labelStyle={{ color: 'rgba(0, 225, 255, 0.9)', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ color: 'rgba(237, 248, 255, 0.8)' }}
              formatter={(value) => <span style={{ color: 'rgba(237, 248, 255, 0.8)' }}>{value}</span>}
            />
            {/* Fondo con patrón de escaneo */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#scanline)" fillOpacity={0.05} />
            
            {/* Área de tareas completadas con efecto mejorado */}
            <Area
              type="monotone"
              dataKey="completed"
              name="Tareas completadas"
              stroke="rgba(0, 225, 255, 0.9)"
              fillOpacity={1}
              fill="url(#colorCompleted)"
              strokeWidth={2}
              activeDot={props => <AnimatedActiveDot {...props} fill="rgba(0, 225, 255, 0.9)" stroke="rgba(0, 225, 255, 0.3)" />}
              dot={props => <AnimatedDot {...props} fill="rgba(0, 225, 255, 0.8)" stroke="rgba(0, 225, 255, 0.3)" />}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-in-out"
              style={{filter: "drop-shadow(0 0 3px rgba(0, 225, 255, 0.5))"}}
            />
            
            {/* Área de tareas nuevas con efecto mejorado y color púrpura neón */}
            <Area
              type="monotone"
              dataKey="created"
              name="Tareas nuevas"
              stroke="rgba(187, 0, 255, 0.8)" // Cambiado a morado neon
              fillOpacity={1}
              fill="url(#colorCreated)"
              strokeWidth={2}
              strokeDasharray="5 5"
              activeDot={props => <AnimatedActiveDot {...props} fill="rgba(187, 0, 255, 0.9)" stroke="rgba(187, 0, 255, 0.3)" />}
              dot={props => <AnimatedDot {...props} fill="rgba(187, 0, 255, 0.8)" stroke="rgba(187, 0, 255, 0.3)" />}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-in-out"
              style={{filter: "drop-shadow(0 0 3px rgba(187, 0, 255, 0.5))"}}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
