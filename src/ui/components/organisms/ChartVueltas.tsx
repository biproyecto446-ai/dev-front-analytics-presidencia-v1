"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { ComparativaItem } from "@ui/types/analytics";

const VUELTA_COLORS: Record<string, string> = {
  "Primera vuelta": "#3b82f6",
  "Segunda vuelta": "#ef4444",
};

interface Props {
  data: ComparativaItem[];
}

export function ChartVueltas({ data }: Props) {
  const candidatos = [...new Set(data.map((d) => d.candidato))];
  const vueltas = [...new Set(data.map((d) => d.vuelta))].sort();

  const chartData = candidatos.map((candidato) => {
    const row: Record<string, unknown> = { candidato };
    for (const vuelta of vueltas) {
      const item = data.find((d) => d.candidato === candidato && d.vuelta === vuelta);
      row[vuelta] = item?.votos ?? 0;
    }
    return row;
  });

  const sorted = chartData
    .sort((a, b) => {
      const aTotal = vueltas.reduce((sum, v) => sum + ((a[v] as number) || 0), 0);
      const bTotal = vueltas.reduce((sum, v) => sum + ((b[v] as number) || 0), 0);
      return bTotal - aTotal;
    })
    .slice(0, 8);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} margin={{ bottom: 80, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
          <XAxis
            dataKey="candidato"
            fontSize={10}
            angle={-45}
            textAnchor="end"
            interval={0}
            tickFormatter={(v) => { const s = String(v); return s.length > 18 ? s.slice(0, 18) + "…" : s; }}
            stroke="#94a3b8"
          />
          <YAxis
            tickFormatter={(v) => { const n = Number(v); return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n); }}
            fontSize={12}
            stroke="#94a3b8"
          />
          <Tooltip formatter={(value) => Number(value).toLocaleString("es-CO")} contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "8px" }} labelStyle={{ color: "#f1f5f9" }} />
          <Legend />
          {vueltas.map((vuelta) => (
            <Bar
              key={vuelta}
              dataKey={vuelta}
              fill={VUELTA_COLORS[vuelta] ?? "#6b7280"}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
