"use client";

import type { PartidoResult } from "@ui/types/analytics";

interface Props {
  data: PartidoResult[];
}

export function TablePartidos({ data }: Props) {
  return (
    <div className="max-h-[500px] overflow-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-surface-raised text-xs uppercase text-text-secondary">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Candidato</th>
            <th className="px-4 py-3">Partido</th>
            <th className="px-4 py-3 text-right">Votos</th>
            <th className="px-4 py-3 text-right">%</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={`${row.partido}-${row.candidato}`}
              className={i % 2 === 0 ? "bg-surface-raised/50" : "bg-transparent"}
            >
              <td className="px-4 py-2 text-text-muted">{i + 1}</td>
              <td className="px-4 py-2 font-medium text-text-primary">{row.candidato}</td>
              <td className="px-4 py-2 text-text-secondary">{row.partido}</td>
              <td className="px-4 py-2 text-right font-mono text-text-primary">
                {row.votos.toLocaleString("es-CO")}
              </td>
              <td className="px-4 py-2 text-right font-mono text-brand-400">
                {row.porcentaje}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
