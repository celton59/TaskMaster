import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  completed: number;
  created: number;
}

interface TaskChartProps {
  data: ChartData[];
}

export function TaskChart({ data }: TaskChartProps) {
  return (
    <div className="w-full">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
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
            <Line
              type="monotone"
              dataKey="completed"
              name="Tareas completadas"
              stroke="rgba(0, 225, 255, 0.9)"
              activeDot={{ r: 8, fill: 'rgba(0, 225, 255, 0.9)', stroke: 'rgba(0, 225, 255, 0.3)' }}
              strokeWidth={2}
              dot={{ fill: 'rgba(0, 225, 255, 0.8)', strokeWidth: 2, r: 4, stroke: 'rgba(0, 225, 255, 0.3)' }}
              fill="rgba(0, 225, 255, 0.05)"
            />
            <Line
              type="monotone"
              dataKey="created"
              name="Tareas nuevas"
              stroke="rgba(138, 180, 248, 0.8)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'rgba(138, 180, 248, 0.8)', strokeWidth: 2, r: 4, stroke: 'rgba(138, 180, 248, 0.3)' }}
              fill="rgba(138, 180, 248, 0.05)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
