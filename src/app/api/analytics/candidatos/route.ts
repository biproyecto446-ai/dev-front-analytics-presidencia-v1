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

    const rows = await query<{ nombre_candidato: string; partido: string; total_votos: string }>(
      `SELECT pr.nombre_candidato, pr.partido, SUM(pr.votos) as total_votos
       FROM presidencia_resultados pr
       ${where}
       GROUP BY pr.nombre_candidato, pr.partido
       ORDER BY total_votos DESC`,
      params
    );

    return NextResponse.json({
      data: rows.map((r) => ({
        candidato: r.nombre_candidato,
        partido: r.partido,
        votos: Number(r.total_votos),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
