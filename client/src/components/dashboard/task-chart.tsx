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
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Progreso de tareas</CardTitle>
      </CardHeader>
      <CardContent>
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
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                name="Tareas completadas"
                stroke="#22c55e"
                activeDot={{ r: 8 }}
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
                fill="rgba(34, 197, 94, 0.1)"
              />
              <Line
                type="monotone"
                dataKey="created"
                name="Tareas nuevas"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
                fill="rgba(59, 130, 246, 0.1)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
