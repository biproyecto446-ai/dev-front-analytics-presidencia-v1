"use client";

interface CompItem {
  anio: number;
  vuelta: string;
  totalVotos: number;
  totalCandidatos: number;
  totalPartidos: number;
  primero: { candidato: string; votos: number; pct: number };
  segundo: { candidato: string; votos: number; pct: number };
  margen: number;
}

interface Props {
  data: CompItem[];
}

export function ComparativoAnios({ data }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((item) => (
        <div
          key={`${item.anio}-${item.vuelta}`}
          className="rounded-2xl border border-border bg-surface-raised p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-text-primary">{item.anio}</h4>
              <span className="text-xs font-medium text-brand-400">{item.vuelta}</span>
            </div>
            <div className="text-right text-xs text-text-muted">
              <p>{item.totalVotos.toLocaleString("es-CO")} votos</p>
              <p>{item.totalCandidatos} candidatos · {item.totalPartidos} partidos</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-accent-green/10 p-3">
              <span className="text-lg">🥇</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{item.primero.candidato}</p>
                <p className="text-xs text-text-muted">{item.primero.votos.toLocaleString("es-CO")} votos</p>
              </div>
              <span className="text-lg font-bold text-accent-green">{item.primero.pct}%</span>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-surface-overlay/30 p-3">
              <span className="text-lg">🥈</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{item.segundo.candidato}</p>
                <p className="text-xs text-text-muted">{item.segundo.votos.toLocaleString("es-CO")} votos</p>
              </div>
              <span className="text-lg font-bold text-text-secondary">{item.segundo.pct}%</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-600/10 px-3 py-2">
            <span className="text-xs font-medium text-brand-400">Margen de victoria</span>
            <span className="font-mono text-sm font-bold text-brand-400">{item.margen} pts</span>
          </div>
        </div>
      ))}
    </div>
  );
}
