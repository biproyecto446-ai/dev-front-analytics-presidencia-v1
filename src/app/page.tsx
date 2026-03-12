"use client";

import { useState, useMemo } from "react";
import { StatCard, Card, Select, Spinner } from "@ui/components/atoms";
import {
  ChartPartidos,
  ChartPiePartidos,
  ChartDepartamentos,
  ChartEvolucion,
  ChartVueltas,
  TablePartidos,
  TopDepartamentos,
  TopMunicipios,
  ComparativoAnios,
  DominanciaTable,
  ConcentracionTable,
  HeadToHead,
} from "@ui/components/organisms";
import { useFetch, buildUrl } from "@ui/hooks/useAnalytics";
import type {
  Resumen,
  Filtros,
  PartidoResult,
  DepartamentoResult,
  EvolucionItem,
  ComparativaItem,
} from "@ui/types/analytics";

type Tab =
  | "resumen"
  | "partidos"
  | "departamentos"
  | "municipios"
  | "evolucion"
  | "vueltas"
  | "comparativo"
  | "dominancia"
  | "concentracion"
  | "h2h";

const TAB_CONFIG: { key: Tab; label: string; icon: string }[] = [
  { key: "resumen", label: "Resumen", icon: "◉" },
  { key: "partidos", label: "Partidos", icon: "◎" },
  { key: "departamentos", label: "Departamentos", icon: "▦" },
  { key: "municipios", label: "Municipios", icon: "▣" },
  { key: "evolucion", label: "Evolución", icon: "↗" },
  { key: "vueltas", label: "1ra vs 2da", icon: "⇄" },
  { key: "comparativo", label: "Comparativo", icon: "≡" },
  { key: "dominancia", label: "Dominancia", icon: "◆" },
  { key: "concentracion", label: "Concentración", icon: "◈" },
  { key: "h2h", label: "Head to Head", icon: "⚔" },
];

export default function DashboardPage() {
  const [anio, setAnio] = useState("");
  const [vuelta, setVuelta] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [partido, setPartido] = useState("");
  const [tab, setTab] = useState<Tab>("resumen");
  const [cand1, setCand1] = useState("");
  const [cand2, setCand2] = useState("");

  const { data: filtros } = useFetch<Filtros>("/api/analytics/filtros");
  const { data: resumen, loading: lr } = useFetch<Resumen>("/api/analytics/resumen");

  const partidosUrl = useMemo(() => buildUrl("/api/analytics/partidos", { anio, vuelta }), [anio, vuelta]);
  const deptUrl = useMemo(() => buildUrl("/api/analytics/departamentos", { anio, vuelta, partido }), [anio, vuelta, partido]);
  const evoUrl = useMemo(() => buildUrl("/api/analytics/evolucion", { vuelta, departamento, top: 8 }), [vuelta, departamento]);
  const vueltasUrl = useMemo(() => buildUrl("/api/analytics/comparativa-vueltas", { anio }), [anio]);
  const topDeptUrl = useMemo(() => buildUrl("/api/analytics/top-departamentos", { anio, vuelta, limit: 35 }), [anio, vuelta]);
  const topMuniUrl = useMemo(() => buildUrl("/api/analytics/top-municipios", { anio, vuelta, departamento, limit: 50 }), [anio, vuelta, departamento]);
  const compAniosUrl = useMemo(() => buildUrl("/api/analytics/comparativo-anios", { vuelta, departamento }), [vuelta, departamento]);
  const domUrl = useMemo(() => buildUrl("/api/analytics/dominancia", { anio, vuelta }), [anio, vuelta]);
  const concUrl = useMemo(() => buildUrl("/api/analytics/concentracion", { anio, vuelta }), [anio, vuelta]);
  const candUrl = useMemo(() => buildUrl("/api/analytics/candidatos", { anio, vuelta }), [anio, vuelta]);
  const h2hUrl = useMemo(() => {
    if (!cand1 || !cand2) return null;
    return buildUrl("/api/analytics/head-to-head", { anio, vuelta, candidato1: cand1, candidato2: cand2 });
  }, [anio, vuelta, cand1, cand2]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type AnyData = { data: any[] };
  const { data: partidosData, loading: lp } = useFetch<{ data: PartidoResult[] }>(tab === "partidos" || tab === "resumen" ? partidosUrl : null);
  const { data: deptData, loading: ld } = useFetch<{ data: DepartamentoResult[] }>(tab === "departamentos" || tab === "resumen" ? deptUrl : null);
  const { data: evoData, loading: le } = useFetch<{ data: EvolucionItem[]; partidos: string[] }>(tab === "evolucion" ? evoUrl : null);
  const { data: vueltasData, loading: lv } = useFetch<{ data: ComparativaItem[] }>(tab === "vueltas" ? vueltasUrl : null);
  const { data: topDeptData, loading: ltd } = useFetch<AnyData>(tab === "departamentos" || tab === "resumen" ? topDeptUrl : null);
  const { data: topMuniData, loading: ltm } = useFetch<AnyData>(tab === "municipios" ? topMuniUrl : null);
  const { data: compData, loading: lc } = useFetch<AnyData>(tab === "comparativo" ? compAniosUrl : null);
  const { data: domData, loading: ldom } = useFetch<AnyData>(tab === "dominancia" ? domUrl : null);
  const { data: concData, loading: lconc } = useFetch<AnyData>(tab === "concentracion" ? concUrl : null);
  const { data: candData } = useFetch<AnyData>(tab === "h2h" ? candUrl : null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: h2hData, loading: lh2h } = useFetch<any>(h2hUrl);

  const activeFilters = [anio, vuelta, departamento, partido].filter(Boolean).length;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-56 flex-shrink-0 flex-col border-r border-border bg-surface-raised/50">
        <div className="flex items-center gap-3 border-b border-border px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
            CO
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary">Analytics</h1>
            <p className="text-[10px] text-text-muted">Presidencia Colombia</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {TAB_CONFIG.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all ${
                tab === t.key
                  ? "bg-brand-600/15 text-brand-400"
                  : "text-text-secondary hover:bg-surface-overlay/30 hover:text-text-primary"
              }`}
            >
              <span className="w-4 text-center text-xs opacity-60">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-surface-overlay/20 px-3 py-2 text-center text-[10px] text-text-muted">
            CNE Electoral Data
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/80 px-6 py-3 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {TAB_CONFIG.find((t) => t.key === tab)?.label}
            </h2>
            <p className="text-xs text-text-muted">
              Resultados electorales presidenciales
              {anio && ` · ${anio}`}
              {vuelta && ` · ${vuelta}`}
            </p>
          </div>
          {activeFilters > 0 && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-600/20 px-2.5 py-0.5 text-xs font-medium text-brand-400">
                {activeFilters} filtro{activeFilters > 1 ? "s" : ""} activo{activeFilters > 1 ? "s" : ""}
              </span>
              <button
                onClick={() => { setAnio(""); setVuelta(""); setDepartamento(""); setPartido(""); }}
                className="text-xs text-text-muted hover:text-accent-red"
              >
                Limpiar
              </button>
            </div>
          )}
        </header>

        <div className="p-6">
          {/* KPIs */}
          {lr ? (
            <Spinner />
          ) : resumen ? (
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatCard label="Total Votos" value={resumen.totalVotos} icon={<span>🗳️</span>} accentColor="from-brand-600 to-brand-400" />
              <StatCard label="Registros" value={resumen.totalRegistros} icon={<span>📊</span>} accentColor="from-accent-green to-accent-cyan" />
              <StatCard label="Mesas" value={resumen.totalMesas} icon={<span>📋</span>} accentColor="from-accent-purple to-brand-400" />
              <StatCard label="Partidos" value={resumen.totalPartidos} icon={<span>🏛️</span>} accentColor="from-accent-amber to-accent-red" />
              <StatCard label="Departamentos" value={resumen.totalDepartamentos} icon={<span>🗺️</span>} accentColor="from-accent-cyan to-brand-500" />
            </div>
          ) : null}

          {/* Filtros */}
          <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface-card p-4 backdrop-blur-sm">
            <Select label="Año" value={anio} onChange={setAnio} options={(filtros?.anios ?? []).map((a) => ({ value: String(a), label: String(a) }))} />
            <Select label="Vuelta" value={vuelta} onChange={setVuelta} options={(filtros?.vueltas ?? []).map((v) => ({ value: v, label: v }))} />
            <Select label="Departamento" value={departamento} onChange={setDepartamento} options={(filtros?.departamentos ?? []).map((d) => ({ value: d.codigo, label: d.nombre }))} />
            <Select label="Partido" value={partido} onChange={setPartido} options={(filtros?.partidos ?? []).map((p) => ({ value: p, label: p.length > 35 ? p.slice(0, 35) + "…" : p }))} />
          </div>

          {/* =================== RESUMEN =================== */}
          {tab === "resumen" && (
            <div className="space-y-6">
              {resumen && (
                <div className="grid gap-6 md:grid-cols-2">
                  <Card title="Participación por Año">
                    <div className="space-y-2">
                      {resumen.votosPorAnio.map((r) => (
                        <div key={r.anio} className="flex items-center justify-between rounded-lg bg-surface-overlay/20 px-4 py-3">
                          <span className="text-lg font-bold text-text-primary">{r.anio}</span>
                          <span className="font-mono text-lg text-brand-400">{r.votos.toLocaleString("es-CO")}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card title="Participación por Vuelta">
                    <div className="space-y-2">
                      {resumen.votosPorVuelta.map((r) => (
                        <div key={r.vuelta} className="flex items-center justify-between rounded-lg bg-surface-overlay/20 px-4 py-3">
                          <span className="font-semibold text-text-primary">{r.vuelta}</span>
                          <span className="font-mono text-lg text-brand-400">{r.votos.toLocaleString("es-CO")}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                <Card title="Distribución por Candidato">
                  {lp ? <Spinner /> : partidosData?.data ? <ChartPiePartidos data={partidosData.data} /> : null}
                </Card>
                <Card title="Top 10 Candidatos">
                  {lp ? <Spinner /> : partidosData?.data ? <ChartPartidos data={partidosData.data} maxBars={10} /> : null}
                </Card>
              </div>
              <Card title="Top 10 Departamentos">
                {ltd ? <Spinner /> : topDeptData?.data ? <TopDepartamentos data={topDeptData.data.slice(0, 10)} /> : null}
              </Card>
            </div>
          )}

          {/* =================== PARTIDOS =================== */}
          {tab === "partidos" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card title="Votación por Candidato">
                  {lp ? <Spinner /> : partidosData?.data ? <ChartPartidos data={partidosData.data} /> : null}
                </Card>
                <Card title="Distribución Porcentual">
                  {lp ? <Spinner /> : partidosData?.data ? <ChartPiePartidos data={partidosData.data} /> : null}
                </Card>
              </div>
              <Card title="Tabla Detallada">
                {lp ? <Spinner /> : partidosData?.data ? <TablePartidos data={partidosData.data} /> : null}
              </Card>
            </div>
          )}

          {/* =================== DEPARTAMENTOS =================== */}
          {tab === "departamentos" && (
            <div className="space-y-6">
              <Card title="Votación por Departamento">
                {ld ? <Spinner /> : deptData?.data ? <ChartDepartamentos data={deptData.data} maxBars={35} /> : null}
              </Card>
              <Card title="Ranking con Ganador">
                {ltd ? <Spinner /> : topDeptData?.data ? <TopDepartamentos data={topDeptData.data} /> : null}
              </Card>
            </div>
          )}

          {/* =================== MUNICIPIOS =================== */}
          {tab === "municipios" && (
            <Card title="Top 50 Municipios" subtitle="Ganador por municipio incluido">
              {ltm ? <Spinner /> : topMuniData?.data ? <TopMunicipios data={topMuniData.data} /> : null}
            </Card>
          )}

          {/* =================== EVOLUCIÓN =================== */}
          {tab === "evolucion" && (
            <Card title="Evolución Histórica" subtitle="Top 8 partidos entre elecciones">
              {le ? <Spinner /> : evoData?.data && evoData.partidos ? <ChartEvolucion data={evoData.data} partidos={evoData.partidos} /> : null}
            </Card>
          )}

          {/* =================== VUELTAS =================== */}
          {tab === "vueltas" && (
            <Card title="Primera vs Segunda Vuelta">
              {lv ? <Spinner /> : vueltasData?.data ? <ChartVueltas data={vueltasData.data} /> : null}
            </Card>
          )}

          {/* =================== COMPARATIVO =================== */}
          {tab === "comparativo" && (
            <Card title="Comparativo entre Elecciones" subtitle="Ganadores, márgenes de victoria y participación">
              {lc ? <Spinner /> : compData?.data ? <ComparativoAnios data={compData.data} /> : null}
            </Card>
          )}

          {/* =================== DOMINANCIA =================== */}
          {tab === "dominancia" && (
            <Card title="Dominancia Regional" subtitle="Partido dominante por departamento, margen de victoria e índice de competitividad">
              {ldom ? <Spinner /> : domData?.data ? <DominanciaTable data={domData.data} /> : null}
            </Card>
          )}

          {/* =================== CONCENTRACIÓN =================== */}
          {tab === "concentracion" && (
            <Card title="Concentración del Voto" subtitle="Índice HHI: valor alto = votos concentrados en pocos departamentos; valor bajo = dispersión amplia">
              {lconc ? <Spinner /> : concData?.data ? <ConcentracionTable data={concData.data} /> : null}
            </Card>
          )}

          {/* =================== HEAD TO HEAD =================== */}
          {tab === "h2h" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-surface-card p-4 backdrop-blur-sm">
                <Select
                  label="Candidato 1"
                  value={cand1}
                  onChange={setCand1}
                  allLabel="Seleccionar..."
                  options={(candData?.data ?? []).map((c: { candidato: string; partido: string }) => ({
                    value: c.candidato,
                    label: `${c.candidato} (${c.partido.length > 20 ? c.partido.slice(0, 20) + "…" : c.partido})`,
                  }))}
                />
                <Select
                  label="Candidato 2"
                  value={cand2}
                  onChange={setCand2}
                  allLabel="Seleccionar..."
                  options={(candData?.data ?? [])
                    .filter((c: { candidato: string }) => c.candidato !== cand1)
                    .map((c: { candidato: string; partido: string }) => ({
                      value: c.candidato,
                      label: `${c.candidato} (${c.partido.length > 20 ? c.partido.slice(0, 20) + "…" : c.partido})`,
                    }))}
                />
              </div>
              {cand1 && cand2 ? (
                <Card title={`${cand1} vs ${cand2}`} subtitle="Comparación departamento por departamento">
                  {lh2h ? <Spinner /> : h2hData ? <HeadToHead data={h2hData} /> : null}
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-card/50 py-20 text-center">
                  <span className="mb-3 text-3xl opacity-30">⚔</span>
                  <p className="text-sm text-text-muted">Selecciona dos candidatos para comparar</p>
                  <p className="text-xs text-text-muted/60">Análisis departamento por departamento</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
