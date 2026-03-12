"use client";

interface ConcItem {
  partido: string;
  candidato: string;
  totalVotos: number;
  numDepartamentos: number;
  numMunicipios: number;
  deptMayorVotos: string;
  votosDeptMayor: number;
  pctEnDeptMayor: number;
  indiceConcentracion: number;
}

interface Props {
  data: ConcItem[];
  maxRows?: number;
}

function concentracionLabel(idx: number) {
  if (idx > 2000) return { text: "Muy concentrado", color: "bg-accent-red/15 text-accent-red" };
  if (idx > 1000) return { text: "Concentrado", color: "bg-accent-amber/15 text-accent-amber" };
  if (idx > 500) return { text: "Moderado", color: "bg-accent-cyan/15 text-accent-cyan" };
  return { text: "Disperso", color: "bg-accent-green/15 text-accent-green" };
}

export function ConcentracionTable({ data, maxRows = 15 }: Props) {
  const sliced = data.slice(0, maxRows);

  return (
    <div className="max-h-[600px] overflow-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-surface-raised text-xs uppercase text-text-secondary">
          <tr>
            <th className="px-3 py-3">Candidato</th>
            <th className="px-3 py-3">Partido</th>
            <th className="px-3 py-3 text-right">Votos</th>
            <th className="px-3 py-3 text-center">Depts</th>
            <th className="px-3 py-3 text-center">Munis</th>
            <th className="px-3 py-3">Mayor presencia</th>
            <th className="px-3 py-3 text-right">% allí</th>
            <th className="px-3 py-3 text-center">Dispersión</th>
          </tr>
        </thead>
        <tbody>
          {sliced.map((row, i) => {
            const conc = concentracionLabel(row.indiceConcentracion);
            return (
              <tr
                key={`${row.partido}-${row.candidato}`}
                className={i % 2 === 0 ? "bg-surface-raised/50" : "bg-transparent"}
              >
                <td className="px-3 py-2 font-semibold text-text-primary">{row.candidato}</td>
                <td className="max-w-[140px] truncate px-3 py-2 text-xs text-text-muted">{row.partido}</td>
                <td className="px-3 py-2 text-right font-mono text-text-primary">
                  {row.totalVotos.toLocaleString("es-CO")}
                </td>
                <td className="px-3 py-2 text-center text-text-secondary">{row.numDepartamentos}</td>
                <td className="px-3 py-2 text-center text-text-secondary">{row.numMunicipios}</td>
                <td className="px-3 py-2 text-text-secondary">{row.deptMayorVotos}</td>
                <td className="px-3 py-2 text-right font-mono text-brand-400">{row.pctEnDeptMayor}%</td>
                <td className="px-3 py-2 text-center">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${conc.color}`}>{conc.text}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
