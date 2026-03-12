import { NextRequest, NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const anio = searchParams.get("anio");

  try {
    let where = "WHERE 1=1";
    const params: unknown[] = [];
    let idx = 1;

    if (anio) {
      where += ` AND pr.anio_eleccion = $${idx++}`;
      params.push(Number(anio));
    }

    const rows = await query<{
      anio_eleccion: number;
      circunscripcion: string;
      partido: string;
      nombre_candidato: string;
      total_votos: string;
    }>(
      `SELECT 
        pr.anio_eleccion,
        pr.circunscripcion,
        pr.partido,
        pr.nombre_candidato,
        SUM(pr.votos) as total_votos
      FROM presidencia_resultados pr
      ${where}
      GROUP BY pr.anio_eleccion, pr.circunscripcion, pr.partido, pr.nombre_candidato
      ORDER BY pr.anio_eleccion, pr.circunscripcion, total_votos DESC`,
      params
    );

    return NextResponse.json({
      filters: { anio },
      data: rows.map((r) => ({
        anio: r.anio_eleccion,
        vuelta: r.circunscripcion,
        partido: r.partido,
        candidato: r.nombre_candidato,
        votos: Number(r.total_votos),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
