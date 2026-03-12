"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { PartidoResult } from "@ui/types/analytics";

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#84cc16", "#14b8a6", "#e11d48", "#0ea5e9", "#eab308", "#8b5cf6"];

interface Props {
  data: PartidoResult[];
  maxSlices?: number;
}

export function ChartPiePartidos({ data, maxSlices = 8 }: Props) {
  const top = data.slice(0, maxSlices);
  const otrosVotos = data.slice(maxSlices).reduce((sum, d) => sum + d.votos, 0);

  const pieData = [
    ...top.map((d) => ({ name: d.candidato, value: d.votos })),
    ...(otrosVotos > 0 ? [{ name: "Otros", value: otrosVotos }] : []),
  ];

  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={130}
            innerRadius={60}
            paddingAngle={2}
            label={(props) => {
              const n = String(props.name ?? "");
              const p = Number(props.percent ?? 0);
              return `${n.length > 15 ? n.slice(0, 15) + "…" : n} ${(p * 100).toFixed(1)}%`;
            }}
            labelLine
            fontSize={10}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => Number(value).toLocaleString("es-CO")} contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "8px" }} labelStyle={{ color: "#f1f5f9" }} />
          <Legend
            wrapperStyle={{ fontSize: "11px" }}
            formatter={(value) => { const s = String(value); return s.length > 25 ? s.slice(0, 25) + "…" : s; }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
