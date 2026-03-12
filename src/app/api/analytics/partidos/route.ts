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

    if (anio) {
      where += ` AND pr.anio_eleccion = $${idx++}`;
      params.push(Number(anio));
    }
    if (vuelta) {
      where += ` AND pr.circunscripcion = $${idx++}`;
      params.push(vuelta);
    }

    const rows = await query<{
      partido: string;
      nombre_candidato: string;
      total_votos: string;
      porcentaje: string;
    }>(
      `SELECT 
        pr.partido,
        pr.nombre_candidato,
        SUM(pr.votos) as total_votos,
        ROUND(SUM(pr.votos) * 100.0 / NULLIF(SUM(SUM(pr.votos)) OVER(), 0), 2) as porcentaje
      FROM presidencia_resultados pr
      ${where}
      GROUP BY pr.partido, pr.nombre_candidato
      ORDER BY total_votos DESC`,
      params
    );

    return NextResponse.json({
      filters: { anio, vuelta },
      count: rows.length,
      data: rows.map((r) => ({
        partido: r.partido,
        candidato: r.nombre_candidato,
        votos: Number(r.total_votos),
        porcentaje: Number(r.porcentaje),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
