"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { EvolucionItem } from "@ui/types/analytics";

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#84cc16", "#14b8a6", "#e11d48", "#0ea5e9", "#eab308", "#8b5cf6"];

interface Props {
  data: EvolucionItem[];
  partidos: string[];
}

export function ChartEvolucion({ data, partidos }: Props) {
  const anios = [...new Set(data.map((d) => d.anio))].sort();

  const chartData = anios.map((anio) => {
    const row: Record<string, unknown> = { anio };
    for (const partido of partidos) {
      const item = data.find((d) => d.anio === anio && d.partido === partido);
      row[partido] = item?.votos ?? 0;
    }
    return row;
  });

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
          <XAxis dataKey="anio" fontSize={12} stroke="#94a3b8" />
          <YAxis
            tickFormatter={(v) => { const n = Number(v); return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n); }}
            fontSize={12}
            stroke="#94a3b8"
          />
          <Tooltip formatter={(value) => Number(value).toLocaleString("es-CO")} contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "8px" }} labelStyle={{ color: "#f1f5f9" }} />
          <Legend
            wrapperStyle={{ fontSize: "11px" }}
            formatter={(value) => { const s = String(value); return s.length > 30 ? s.slice(0, 30) + "…" : s; }}
          />
          {partidos.map((partido, i) => (
            <Line
              key={partido}
              type="monotone"
              dataKey={partido}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
