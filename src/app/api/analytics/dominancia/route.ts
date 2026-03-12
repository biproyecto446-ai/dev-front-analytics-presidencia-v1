import { NextRequest, NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const anio = searchParams.get("anio");
  const vuelta = searchParams.get("vuelta");

  try {
    let where = "WHERE 1=1";
    const params: unknown[] = [];
    let idx = 1;

    if (anio) { where += ` AND pr.anio_eleccion = $${idx++}`; params.push(Number(anio)); }
    if (vuelta) { where += ` AND pr.circunscripcion = $${idx++}`; params.push(vuelta); }

    const rows = await query<{
      codigo_departamento: string;
      departamento: string;
      partido_dominante: string;
      candidato_dominante: string;
      votos_dominante: string;
      total_votos_dept: string;
      pct_dominancia: string;
      segundo_partido: string;
      votos_segundo: string;
      pct_segundo: string;
      indice_competitividad: string;
    }>(
      `WITH dept_partido AS (
        SELECT 
          TRIM(pr.codigo_departamento) as codigo_departamento,
          COALESCE(d.nombre, 'N/A') as departamento,
          pr.partido,
          pr.nombre_candidato,
          SUM(pr.votos) as votos_partido,
          SUM(SUM(pr.votos)) OVER(PARTITION BY TRIM(pr.codigo_departamento)) as total_votos_dept,
          ROW_NUMBER() OVER(PARTITION BY TRIM(pr.codigo_departamento) ORDER BY SUM(pr.votos) DESC) as rn
        FROM presidencia_resultados pr
        LEFT JOIN divi_departamentos d ON TRIM(pr.codigo_departamento) = d.codigo_departamento
        ${where}
        GROUP BY TRIM(pr.codigo_departamento), d.nombre, pr.partido, pr.nombre_candidato
      )
      SELECT 
        p1.codigo_departamento,
        p1.departamento,
        p1.partido as partido_dominante,
        p1.nombre_candidato as candidato_dominante,
        p1.votos_partido as votos_dominante,
        p1.total_votos_dept,
        ROUND(p1.votos_partido * 100.0 / NULLIF(p1.total_votos_dept, 0), 2) as pct_dominancia,
        p2.partido as segundo_partido,
        p2.votos_partido as votos_segundo,
        ROUND(p2.votos_partido * 100.0 / NULLIF(p1.total_votos_dept, 0), 2) as pct_segundo,
        ROUND((p1.votos_partido - COALESCE(p2.votos_partido, 0)) * 100.0 / NULLIF(p1.total_votos_dept, 0), 2) as indice_competitividad
      FROM dept_partido p1
      LEFT JOIN dept_partido p2 ON p1.codigo_departamento = p2.codigo_departamento AND p2.rn = 2
      WHERE p1.rn = 1
      ORDER BY pct_dominancia DESC`,
      params
    );

    return NextResponse.json({
      filters: { anio, vuelta },
      data: rows.map((r) => ({
        codigo: r.codigo_departamento,
        departamento: r.departamento,
        partidoDominante: r.partido_dominante,
        candidatoDominante: r.candidato_dominante,
        votosDominante: Number(r.votos_dominante),
        totalVotos: Number(r.total_votos_dept),
        pctDominancia: Number(r.pct_dominancia),
        segundoPartido: r.segundo_partido,
        votosSegundo: Number(r.votos_segundo),
        pctSegundo: Number(r.pct_segundo),
        margenVictoria: Number(r.indice_competitividad),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
