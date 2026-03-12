import { NextRequest, NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const anio = searchParams.get("anio");
  const vuelta = searchParams.get("vuelta");
  const partido = searchParams.get("partido");

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
    if (partido) {
      where += ` AND pr.partido = $${idx++}`;
      params.push(partido);
    }

    const rows = await query<{
      codigo_departamento: string;
      departamento: string;
      total_votos: string;
      porcentaje: string;
    }>(
      `SELECT 
        pr.codigo_departamento,
        COALESCE(d.nombre, 'SIN DEPARTAMENTO') as departamento,
        SUM(pr.votos) as total_votos,
        ROUND(SUM(pr.votos) * 100.0 / NULLIF(SUM(SUM(pr.votos)) OVER(), 0), 2) as porcentaje
      FROM presidencia_resultados pr
      LEFT JOIN divi_departamentos d ON TRIM(pr.codigo_departamento) = d.codigo_departamento
      ${where}
      GROUP BY pr.codigo_departamento, d.nombre
      ORDER BY total_votos DESC`,
      params
    );

    return NextResponse.json({
      filters: { anio, vuelta, partido },
      count: rows.length,
      data: rows.map((r) => ({
        codigo: r.codigo_departamento?.trim(),
        departamento: r.departamento,
        votos: Number(r.total_votos),
        porcentaje: Number(r.porcentaje),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
