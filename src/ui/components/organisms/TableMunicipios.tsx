"use client";

import type { MunicipioResult } from "@ui/types/analytics";

interface Props {
  data: MunicipioResult[];
}

export function TableMunicipios({ data }: Props) {
  return (
    <div className="max-h-[500px] overflow-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-surface-raised text-xs uppercase text-text-secondary">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Municipio</th>
            <th className="px-4 py-3">Departamento</th>
            <th className="px-4 py-3 text-right">Votos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.codigo}
              className={i % 2 === 0 ? "bg-surface-raised/50" : "bg-transparent"}
            >
              <td className="px-4 py-2 text-text-muted">{i + 1}</td>
              <td className="px-4 py-2 font-medium text-text-primary">{row.municipio}</td>
              <td className="px-4 py-2 text-text-secondary">{row.departamento}</td>
              <td className="px-4 py-2 text-right font-mono text-text-primary">
                {row.votos.toLocaleString("es-CO")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
