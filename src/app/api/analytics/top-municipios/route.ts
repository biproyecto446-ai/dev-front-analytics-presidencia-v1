import { NextRequest, NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const anio = searchParams.get("anio");
  const vuelta = searchParams.get("vuelta");
  const departamento = searchParams.get("departamento");
  const limit = Math.min(Number(searchParams.get("limit") ?? 30), 100);

  try {
    let where = "WHERE 1=1";
    const params: unknown[] = [];
    let idx = 1;

    if (anio) { where += ` AND pr.anio_eleccion = $${idx++}`; params.push(Number(anio)); }
    if (vuelta) { where += ` AND pr.circunscripcion = $${idx++}`; params.push(vuelta); }
    if (departamento) { where += ` AND TRIM(pr.codigo_departamento) = $${idx++}`; params.push(departamento); }
    params.push(limit);

    const rows = await query<{
      codigo_divipole: string;
      municipio: string;
      departamento: string;
      total_votos: string;
      candidato_ganador: string;
      partido_ganador: string;
      votos_ganador: string;
      pct_ganador: string;
    }>(
      `WITH muni_totals AS (
        SELECT 
          TRIM(pr.codigo_divipole) as codigo_divipole,
          COALESCE(m.des_municipio, 'SIN MUNICIPIO') as municipio,
          COALESCE(d.nombre, 'N/A') as departamento,
          SUM(pr.votos) as total_votos
        FROM presidencia_resultados pr
        LEFT JOIN divi_municipio m ON TRIM(pr.codigo_divipole) = m.codigo_divipole
        LEFT JOIN divi_departamentos d ON TRIM(pr.codigo_departamento) = d.codigo_departamento
        ${where}
        GROUP BY TRIM(pr.codigo_divipole), m.des_municipio, d.nombre
      ),
      muni_ganador AS (
        SELECT 
          TRIM(pr.codigo_divipole) as codigo_divipole,
          pr.nombre_candidato,
          pr.partido,
          SUM(pr.votos) as votos_cand,
          ROW_NUMBER() OVER(PARTITION BY TRIM(pr.codigo_divipole) ORDER BY SUM(pr.votos) DESC) as rn
        FROM presidencia_resultados pr
        ${where}
        GROUP BY TRIM(pr.codigo_divipole), pr.nombre_candidato, pr.partido
      )
      SELECT 
        mt.codigo_divipole, mt.municipio, mt.departamento, mt.total_votos,
        mg.nombre_candidato as candidato_ganador,
        mg.partido as partido_ganador,
        mg.votos_cand as votos_ganador,
        ROUND(mg.votos_cand * 100.0 / NULLIF(mt.total_votos, 0), 2) as pct_ganador
      FROM muni_totals mt
      LEFT JOIN muni_ganador mg ON mt.codigo_divipole = mg.codigo_divipole AND mg.rn = 1
      ORDER BY mt.total_votos DESC
      LIMIT $${idx}`,
      params
    );

    return NextResponse.json({
      filters: { anio, vuelta, departamento },
      data: rows.map((r) => ({
        codigo: r.codigo_divipole,
        municipio: r.municipio,
        departamento: r.departamento,
        totalVotos: Number(r.total_votos),
        ganador: r.candidato_ganador,
        partidoGanador: r.partido_ganador,
        votosGanador: Number(r.votos_ganador),
        pctGanador: Number(r.pct_ganador),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
