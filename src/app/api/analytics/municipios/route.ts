import { NextRequest, NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const anio = searchParams.get("anio");
  const vuelta = searchParams.get("vuelta");
  const departamento = searchParams.get("departamento");
  const partido = searchParams.get("partido");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

  try {
    let where = "WHERE 1=1";
    const params: unknown[] = [];
    let idx = 1;

    if (anio) {
      where += ` AND pr.anio_eleccion = $${idx++}`;
      params.push(Number(anio));
    }
    if (vuelta) {
      where += ` AND pr.circunscripcion = $${idx++}`;
      params.push(vuelta);
    }
    if (departamento) {
      where += ` AND TRIM(pr.codigo_departamento) = $${idx++}`;
      params.push(departamento);
    }
    if (partido) {
      where += ` AND pr.partido = $${idx++}`;
      params.push(partido);
    }

    params.push(limit);

    const rows = await query<{
      codigo_divipole: string;
      municipio: string;
      departamento: string;
      total_votos: string;
    }>(
      `SELECT 
        pr.codigo_divipole,
        COALESCE(m.des_municipio, 'SIN MUNICIPIO') as municipio,
        COALESCE(d.nombre, 'SIN DEPARTAMENTO') as departamento,
        SUM(pr.votos) as total_votos
      FROM presidencia_resultados pr
      LEFT JOIN divi_municipio m ON TRIM(pr.codigo_divipole) = m.codigo_divipole
      LEFT JOIN divi_departamentos d ON TRIM(pr.codigo_departamento) = d.codigo_departamento
      ${where}
      GROUP BY pr.codigo_divipole, m.des_municipio, d.nombre
      ORDER BY total_votos DESC
      LIMIT $${idx}`,
      params
    );

    return NextResponse.json({
      filters: { anio, vuelta, departamento, partido },
      count: rows.length,
      data: rows.map((r) => ({
        codigo: r.codigo_divipole?.trim(),
        municipio: r.municipio,
        departamento: r.departamento,
        votos: Number(r.total_votos),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
