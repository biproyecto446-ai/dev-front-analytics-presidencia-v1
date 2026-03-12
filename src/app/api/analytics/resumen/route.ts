import { NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totals, years, rounds, parties, departments] = await Promise.all([
      query<{ total_votos: string; total_registros: string; total_mesas: string }>(
        `SELECT 
          SUM(votos) as total_votos,
          COUNT(*) as total_registros,
          COUNT(DISTINCT mesa) as total_mesas
        FROM presidencia_resultados`
      ),
      query<{ anio_eleccion: number; total_votos: string }>(
        `SELECT anio_eleccion, SUM(votos) as total_votos
         FROM presidencia_resultados
         GROUP BY anio_eleccion ORDER BY anio_eleccion`
      ),
      query<{ circunscripcion: string; total_votos: string }>(
        `SELECT circunscripcion, SUM(votos) as total_votos
         FROM presidencia_resultados
         GROUP BY circunscripcion ORDER BY circunscripcion`
      ),
      query<{ count: string }>(
        `SELECT COUNT(DISTINCT partido) as count FROM presidencia_resultados`
      ),
      query<{ count: string }>(
        `SELECT COUNT(DISTINCT codigo_departamento) as count FROM presidencia_resultados`
      ),
    ]);

    return NextResponse.json({
      totalVotos: Number(totals[0].total_votos),
      totalRegistros: Number(totals[0].total_registros),
      totalMesas: Number(totals[0].total_mesas),
      totalPartidos: Number(parties[0].count),
      totalDepartamentos: Number(departments[0].count),
      votosPorAnio: years.map((r) => ({
        anio: r.anio_eleccion,
        votos: Number(r.total_votos),
      })),
      votosPorVuelta: rounds.map((r) => ({
        vuelta: r.circunscripcion,
        votos: Number(r.total_votos),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
