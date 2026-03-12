"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { PartidoResult } from "@ui/types/analytics";

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#84cc16", "#14b8a6", "#e11d48", "#0ea5e9", "#eab308", "#8b5cf6"];

interface Props {
  data: PartidoResult[];
  maxBars?: number;
}

export function ChartPartidos({ data, maxBars = 10 }: Props) {
  const sliced = data.slice(0, maxBars);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sliced} layout="vertical" margin={{ left: 20, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
          <XAxis
            type="number"
            tickFormatter={(v) => { const n = Number(v); return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n); }}
            fontSize={12}
            stroke="#94a3b8"
          />
          <YAxis
            dataKey="candidato"
            type="category"
            width={180}
            fontSize={11}
            tickFormatter={(v) => { const s = String(v); return s.length > 25 ? s.slice(0, 25) + "…" : s; }}
            stroke="#94a3b8"
          />
          <Tooltip
            formatter={(value) => Number(value).toLocaleString("es-CO")}
            labelFormatter={(label) => {
              const s = String(label);
              const item = sliced.find((d) => d.candidato === s);
              return item ? `${item.candidato} - ${item.partido}` : s;
            }}
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "8px" }}
            labelStyle={{ color: "#f1f5f9" }}
          />
          <Bar dataKey="votos" radius={[0, 4, 4, 0]}>
            {sliced.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
