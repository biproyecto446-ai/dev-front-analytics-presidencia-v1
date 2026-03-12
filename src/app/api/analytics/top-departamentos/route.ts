import { NextRequest, NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const anio = searchParams.get("anio");
  const vuelta = searchParams.get("vuelta");
  const limit = Math.min(Number(searchParams.get("limit") ?? 15), 35);

  try {
    let where = "WHERE 1=1";
    const params: unknown[] = [];
    let idx = 1;

    if (anio) { where += ` AND pr.anio_eleccion = $${idx++}`; params.push(Number(anio)); }
    if (vuelta) { where += ` AND pr.circunscripcion = $${idx++}`; params.push(vuelta); }
    params.push(limit);

    const rows = await query<{
      codigo_departamento: string;
      departamento: string;
      total_votos: string;
      total_mesas: string;
      candidato_ganador: string;
      partido_ganador: string;
      votos_ganador: string;
      participacion_ganador: string;
    }>(
      `WITH dept_totals AS (
        SELECT 
          TRIM(pr.codigo_departamento) as codigo_departamento,
          COALESCE(d.nombre, 'SIN DEPARTAMENTO') as departamento,
          SUM(pr.votos) as total_votos,
          COUNT(DISTINCT pr.mesa) as total_mesas
        FROM presidencia_resultados pr
        LEFT JOIN divi_departamentos d ON TRIM(pr.codigo_departamento) = d.codigo_departamento
        ${where}
        GROUP BY TRIM(pr.codigo_departamento), d.nombre
      ),
      dept_candidatos AS (
        SELECT 
          TRIM(pr.codigo_departamento) as codigo_departamento,
          pr.nombre_candidato,
          pr.partido,
          SUM(pr.votos) as votos_candidato,
          ROW_NUMBER() OVER(PARTITION BY TRIM(pr.codigo_departamento) ORDER BY SUM(pr.votos) DESC) as rn
        FROM presidencia_resultados pr
        ${where}
        GROUP BY TRIM(pr.codigo_departamento), pr.nombre_candidato, pr.partido
      )
      SELECT 
        dt.codigo_departamento,
        dt.departamento,
        dt.total_votos,
        dt.total_mesas,
        dc.nombre_candidato as candidato_ganador,
        dc.partido as partido_ganador,
        dc.votos_candidato as votos_ganador,
        ROUND(dc.votos_candidato * 100.0 / NULLIF(dt.total_votos, 0), 2) as participacion_ganador
      FROM dept_totals dt
      LEFT JOIN dept_candidatos dc ON dt.codigo_departamento = dc.codigo_departamento AND dc.rn = 1
      ORDER BY dt.total_votos DESC
      LIMIT $${idx}`,
      params
    );

    return NextResponse.json({
      filters: { anio, vuelta },
      data: rows.map((r) => ({
        codigo: r.codigo_departamento,
        departamento: r.departamento,
        totalVotos: Number(r.total_votos),
        totalMesas: Number(r.total_mesas),
        ganador: r.candidato_ganador,
        partidoGanador: r.partido_ganador,
        votosGanador: Number(r.votos_ganador),
        pctGanador: Number(r.participacion_ganador),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
