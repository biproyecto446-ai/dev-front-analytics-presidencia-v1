"use client";

interface TopDeptItem {
  codigo: string;
  departamento: string;
  totalVotos: number;
  totalMesas: number;
  ganador: string;
  partidoGanador: string;
  votosGanador: number;
  pctGanador: number;
}

interface Props {
  data: TopDeptItem[];
}

function getBarColor(pct: number) {
  if (pct >= 50) return "bg-accent-green";
  if (pct >= 40) return "bg-brand-500";
  if (pct >= 30) return "bg-accent-amber";
  return "bg-text-muted";
}

export function TopDepartamentos({ data }: Props) {
  const maxVotos = Math.max(...data.map((d) => d.totalVotos), 1);

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div
          key={item.codigo}
          className="rounded-lg border border-border bg-surface-raised/50 p-4 transition-colors hover:bg-surface-raised"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/20 text-sm font-bold text-brand-400">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-text-primary">{item.departamento}</p>
                <p className="text-xs text-text-muted">{item.totalMesas.toLocaleString("es-CO")} mesas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-text-primary">{item.totalVotos.toLocaleString("es-CO")}</p>
              <p className="text-xs text-text-muted">votos totales</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-text-secondary">
                Ganador: <strong className="text-text-primary">{item.ganador}</strong> ({item.partidoGanador})
              </span>
              <span className="font-mono font-semibold text-brand-400">{item.pctGanador}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-overlay">
              <div
                className={`h-2 rounded-full transition-all ${getBarColor(item.pctGanador)}`}
                style={{ width: `${(item.totalVotos / maxVotos) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
