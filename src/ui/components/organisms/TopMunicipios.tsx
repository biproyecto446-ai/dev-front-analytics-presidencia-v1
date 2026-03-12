"use client";

interface TopMuniItem {
  codigo: string;
  municipio: string;
  departamento: string;
  totalVotos: number;
  ganador: string;
  partidoGanador: string;
  votosGanador: number;
  pctGanador: number;
}

interface Props {
  data: TopMuniItem[];
}

export function TopMunicipios({ data }: Props) {
  return (
    <div className="max-h-[600px] overflow-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-surface-raised text-xs uppercase text-text-secondary">
          <tr>
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">Municipio</th>
            <th className="px-3 py-3">Departamento</th>
            <th className="px-3 py-3 text-right">Total Votos</th>
            <th className="px-3 py-3">Ganador</th>
            <th className="px-3 py-3">Partido</th>
            <th className="px-3 py-3 text-right">%</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.codigo}
              className={i % 2 === 0 ? "bg-surface-raised/50" : "bg-transparent"}
            >
              <td className="px-3 py-2 text-text-muted">{i + 1}</td>
              <td className="px-3 py-2 font-semibold text-text-primary">{row.municipio}</td>
              <td className="px-3 py-2 text-text-secondary">{row.departamento}</td>
              <td className="px-3 py-2 text-right font-mono text-text-primary">
                {row.totalVotos.toLocaleString("es-CO")}
              </td>
              <td className="px-3 py-2 text-text-primary">{row.ganador}</td>
              <td className="max-w-[150px] truncate px-3 py-2 text-xs text-text-muted">{row.partidoGanador}</td>
              <td className="px-3 py-2 text-right font-mono font-semibold text-brand-400">{row.pctGanador}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
