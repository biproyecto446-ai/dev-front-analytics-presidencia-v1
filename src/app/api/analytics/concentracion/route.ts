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
      partido: string;
      nombre_candidato: string;
      total_votos: string;
      num_departamentos: string;
      num_municipios: string;
      dept_mayor_votos: string;
      votos_dept_mayor: string;
      pct_en_dept_mayor: string;
      indice_concentracion: string;
    }>(
      `WITH partido_stats AS (
        SELECT 
          pr.partido,
          pr.nombre_candidato,
          SUM(pr.votos) as total_votos,
          COUNT(DISTINCT TRIM(pr.codigo_departamento)) as num_departamentos,
          COUNT(DISTINCT TRIM(pr.codigo_divipole)) as num_municipios
        FROM presidencia_resultados pr
        ${where}
        GROUP BY pr.partido, pr.nombre_candidato
      ),
      partido_dept AS (
        SELECT 
          pr.partido,
          pr.nombre_candidato,
          COALESCE(d.nombre, 'N/A') as departamento,
          SUM(pr.votos) as votos_dept,
          ROW_NUMBER() OVER(PARTITION BY pr.partido, pr.nombre_candidato ORDER BY SUM(pr.votos) DESC) as rn
        FROM presidencia_resultados pr
        LEFT JOIN divi_departamentos d ON TRIM(pr.codigo_departamento) = d.codigo_departamento
        ${where}
        GROUP BY pr.partido, pr.nombre_candidato, d.nombre
      ),
      dept_shares AS (
        SELECT 
          pd.partido,
          pd.nombre_candidato,
          POWER(pd.votos_dept * 100.0 / NULLIF(ps.total_votos, 0), 2) as share_squared
        FROM partido_dept pd
        JOIN partido_stats ps ON pd.partido = ps.partido AND pd.nombre_candidato = ps.nombre_candidato
      ),
      hhi AS (
        SELECT 
          partido,
          nombre_candidato,
          ROUND(SUM(share_squared), 2) as indice_hhi
        FROM dept_shares
        GROUP BY partido, nombre_candidato
      )
      SELECT 
        ps.partido, ps.nombre_candidato, ps.total_votos,
        ps.num_departamentos, ps.num_municipios,
        pd.departamento as dept_mayor_votos,
        pd.votos_dept as votos_dept_mayor,
        ROUND(pd.votos_dept * 100.0 / NULLIF(ps.total_votos, 0), 2) as pct_en_dept_mayor,
        COALESCE(h.indice_hhi, 0) as indice_concentracion
      FROM partido_stats ps
      LEFT JOIN partido_dept pd ON ps.partido = pd.partido AND ps.nombre_candidato = pd.nombre_candidato AND pd.rn = 1
      LEFT JOIN hhi h ON ps.partido = h.partido AND ps.nombre_candidato = h.nombre_candidato
      ORDER BY ps.total_votos DESC`,
      params
    );

    return NextResponse.json({
      filters: { anio, vuelta },
      data: rows.map((r) => ({
        partido: r.partido,
        candidato: r.nombre_candidato,
        totalVotos: Number(r.total_votos),
        numDepartamentos: Number(r.num_departamentos),
        numMunicipios: Number(r.num_municipios),
        deptMayorVotos: r.dept_mayor_votos,
        votosDeptMayor: Number(r.votos_dept_mayor),
        pctEnDeptMayor: Number(r.pct_en_dept_mayor),
        indiceConcentracion: Number(r.indice_concentracion),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
