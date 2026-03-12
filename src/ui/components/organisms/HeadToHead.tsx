"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface H2HData {
  candidato1: { nombre: string; totalVotos: number; deptsGanados: number };
  candidato2: { nombre: string; totalVotos: number; deptsGanados: number };
  porDepartamento: Record<string, unknown>[];
}

interface Props {
  data: H2HData;
}

export function HeadToHead({ data }: Props) {
  const c1 = data.candidato1;
  const c2 = data.candidato2;
  const totalGeneral = c1.totalVotos + c2.totalVotos;

  const chartData = data.porDepartamento
    .sort((a, b) => Math.abs(b.diferencia as number) - Math.abs(a.diferencia as number))
    .slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-xl p-5 bg-surface-raised border border-border ${c1.totalVotos >= c2.totalVotos ? "border-l-4 border-l-[#3b82f6]" : ""}`}>
          <p className="text-sm text-text-muted">Candidato 1</p>
          <p className="text-lg font-bold text-text-primary">{c1.nombre}</p>
          <p className="mt-2 text-2xl font-bold text-[#3b82f6]">{c1.totalVotos.toLocaleString("es-CO")}</p>
          <p className="text-sm text-text-secondary">
            {(c1.totalVotos * 100 / totalGeneral).toFixed(1)}% · {c1.deptsGanados} depts ganados
          </p>
        </div>
        <div className={`rounded-xl p-5 bg-surface-raised border border-border ${c2.totalVotos >= c1.totalVotos ? "border-l-4 border-l-[#ef4444]" : ""}`}>
          <p className="text-sm text-text-muted">Candidato 2</p>
          <p className="text-lg font-bold text-text-primary">{c2.nombre}</p>
          <p className="mt-2 text-2xl font-bold text-[#ef4444]">{c2.totalVotos.toLocaleString("es-CO")}</p>
          <p className="text-sm text-text-secondary">
            {(c2.totalVotos * 100 / totalGeneral).toFixed(1)}% · {c2.deptsGanados} depts ganados
          </p>
        </div>
      </div>

      {/* Gráfico comparativo */}
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
            <XAxis type="number" tickFormatter={(v) => { const n = Number(v); return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n); }} fontSize={11} stroke="#94a3b8" />
            <YAxis dataKey="departamento" type="category" width={140} fontSize={10} stroke="#94a3b8" />
            <Tooltip formatter={(value) => Number(value).toLocaleString("es-CO")} contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "8px" }} labelStyle={{ color: "#f1f5f9" }} />
            <Legend />
            <ReferenceLine x={0} stroke="rgba(148,163,184,0.3)" />
            <Bar dataKey={c1.nombre} fill="#3b82f6" radius={[0, 4, 4, 0]} />
            <Bar dataKey={c2.nombre} fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
