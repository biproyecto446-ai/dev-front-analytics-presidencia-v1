"use client";

interface DomItem {
  codigo: string;
  departamento: string;
  partidoDominante: string;
  candidatoDominante: string;
  votosDominante: number;
  totalVotos: number;
  pctDominancia: number;
  segundoPartido: string;
  votosSegundo: number;
  pctSegundo: number;
  margenVictoria: number;
}

interface Props {
  data: DomItem[];
}

function competitividadLabel(margen: number) {
  if (margen < 5) return { text: "Muy reñido", color: "bg-accent-red/15 text-accent-red" };
  if (margen < 10) return { text: "Competido", color: "bg-accent-amber/15 text-accent-amber" };
  if (margen < 20) return { text: "Moderado", color: "bg-accent-cyan/15 text-accent-cyan" };
  return { text: "Dominante", color: "bg-accent-green/15 text-accent-green" };
}

export function DominanciaTable({ data }: Props) {
  return (
    <div className="max-h-[600px] overflow-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-surface-raised text-xs uppercase text-text-secondary">
          <tr>
            <th className="px-3 py-3">Departamento</th>
            <th className="px-3 py-3">1er Lugar</th>
            <th className="px-3 py-3 text-right">%</th>
            <th className="px-3 py-3">2do Lugar</th>
            <th className="px-3 py-3 text-right">%</th>
            <th className="px-3 py-3 text-right">Margen</th>
            <th className="px-3 py-3 text-center">Competitividad</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const comp = competitividadLabel(row.margenVictoria);
            return (
              <tr
                key={row.codigo}
                className={i % 2 === 0 ? "bg-surface-raised/50" : "bg-transparent"}
              >
                <td className="px-3 py-2 font-semibold text-text-primary">{row.departamento}</td>
                <td className="px-3 py-2">
                  <p className="text-text-primary">{row.candidatoDominante}</p>
                  <p className="max-w-[140px] truncate text-xs text-text-muted">{row.partidoDominante}</p>
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-accent-green">{row.pctDominancia}%</td>
                <td className="px-3 py-2">
                  <p className="max-w-[140px] truncate text-text-secondary">{row.segundoPartido}</p>
                </td>
                <td className="px-3 py-2 text-right font-mono text-text-secondary">{row.pctSegundo}%</td>
                <td className="px-3 py-2 text-right font-mono font-semibold text-brand-400">{row.margenVictoria} pts</td>
                <td className="px-3 py-2 text-center">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${comp.color}`}>{comp.text}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
