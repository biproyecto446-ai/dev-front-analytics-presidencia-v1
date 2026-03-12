import { NextRequest, NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const vuelta = searchParams.get("vuelta");
  const departamento = searchParams.get("departamento");

  try {
    let where = "WHERE 1=1";
    const params: unknown[] = [];
    let idx = 1;

    if (vuelta) { where += ` AND pr.circunscripcion = $${idx++}`; params.push(vuelta); }
    if (departamento) { where += ` AND TRIM(pr.codigo_departamento) = $${idx++}`; params.push(departamento); }

    const rows = await query<{
      anio_eleccion: number;
      circunscripcion: string;
      total_votos: string;
      total_candidatos: string;
      total_partidos: string;
      candidato_1: string;
      votos_1: string;
      pct_1: string;
      candidato_2: string;
      votos_2: string;
      pct_2: string;
      margen: string;
    }>(
      `WITH año_data AS (
        SELECT 
          pr.anio_eleccion,
          pr.circunscripcion,
          SUM(pr.votos) as total_votos,
          COUNT(DISTINCT pr.nombre_candidato) as total_candidatos,
          COUNT(DISTINCT pr.partido) as total_partidos
        FROM presidencia_resultados pr
        ${where}
        GROUP BY pr.anio_eleccion, pr.circunscripcion
      ),
      ranked AS (
        SELECT 
          pr.anio_eleccion,
          pr.circunscripcion,
          pr.nombre_candidato,
          SUM(pr.votos) as votos,
          ROW_NUMBER() OVER(PARTITION BY pr.anio_eleccion, pr.circunscripcion ORDER BY SUM(pr.votos) DESC) as rn
        FROM presidencia_resultados pr
        ${where}
        GROUP BY pr.anio_eleccion, pr.circunscripcion, pr.nombre_candidato
      )
      SELECT 
        ad.anio_eleccion, ad.circunscripcion, ad.total_votos, 
        ad.total_candidatos, ad.total_partidos,
        r1.nombre_candidato as candidato_1, r1.votos as votos_1,
        ROUND(r1.votos * 100.0 / NULLIF(ad.total_votos, 0), 2) as pct_1,
        r2.nombre_candidato as candidato_2, r2.votos as votos_2,
        ROUND(r2.votos * 100.0 / NULLIF(ad.total_votos, 0), 2) as pct_2,
        ROUND((r1.votos - r2.votos) * 100.0 / NULLIF(ad.total_votos, 0), 2) as margen
      FROM año_data ad
      LEFT JOIN ranked r1 ON ad.anio_eleccion = r1.anio_eleccion AND ad.circunscripcion = r1.circunscripcion AND r1.rn = 1
      LEFT JOIN ranked r2 ON ad.anio_eleccion = r2.anio_eleccion AND ad.circunscripcion = r2.circunscripcion AND r2.rn = 2
      ORDER BY ad.anio_eleccion, ad.circunscripcion`,
      params
    );

    return NextResponse.json({
      filters: { vuelta, departamento },
      data: rows.map((r) => ({
        anio: r.anio_eleccion,
        vuelta: r.circunscripcion,
        totalVotos: Number(r.total_votos),
        totalCandidatos: Number(r.total_candidatos),
        totalPartidos: Number(r.total_partidos),
        primero: { candidato: r.candidato_1, votos: Number(r.votos_1), pct: Number(r.pct_1) },
        segundo: { candidato: r.candidato_2, votos: Number(r.votos_2), pct: Number(r.pct_2) },
        margen: Number(r.margen),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
