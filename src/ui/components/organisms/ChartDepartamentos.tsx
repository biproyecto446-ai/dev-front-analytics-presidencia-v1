"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { DepartamentoResult } from "@ui/types/analytics";

interface Props {
  data: DepartamentoResult[];
  maxBars?: number;
}

export function ChartDepartamentos({ data, maxBars = 15 }: Props) {
  const sliced = data.slice(0, maxBars);

  return (
    <div className="h-[450px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sliced} margin={{ bottom: 80, left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
          <XAxis
            dataKey="departamento"
            fontSize={10}
            angle={-45}
            textAnchor="end"
            interval={0}
            tickFormatter={(v) => { const s = String(v); return s.length > 12 ? s.slice(0, 12) + "…" : s; }}
            stroke="#94a3b8"
          />
          <YAxis
            tickFormatter={(v) => { const n = Number(v); return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n); }}
            fontSize={12}
            stroke="#94a3b8"
          />
          <Tooltip
            formatter={(value) => Number(value).toLocaleString("es-CO")}
            labelFormatter={(label) => {
              const s = String(label);
              const item = sliced.find((d) => d.departamento === s);
              return item ? `${item.departamento} (${item.porcentaje}%)` : s;
            }}
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "8px" }}
            labelStyle={{ color: "#f1f5f9" }}
          />
          <Bar dataKey="votos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
