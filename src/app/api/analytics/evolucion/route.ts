import { NextRequest, NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const vuelta = searchParams.get("vuelta");
  const departamento = searchParams.get("departamento");
  const topN = Math.min(Number(searchParams.get("top") ?? 8), 15);

  try {
    let where = "WHERE 1=1";
    const params: unknown[] = [];
    let idx = 1;

    if (vuelta) {
      where += ` AND pr.circunscripcion = $${idx++}`;
      params.push(vuelta);
    }
    if (departamento) {
      where += ` AND TRIM(pr.codigo_departamento) = $${idx++}`;
      params.push(departamento);
    }

    params.push(topN);

    const topPartidos = await query<{ partido: string }>(
      `SELECT pr.partido, SUM(pr.votos) as total
       FROM presidencia_resultados pr
       ${where}
       GROUP BY pr.partido
       ORDER BY total DESC
       LIMIT $${idx}`,
      params
    );

    const partidoNames = topPartidos.map((p) => p.partido);

    if (partidoNames.length === 0) {
      return NextResponse.json({ filters: { vuelta, departamento }, data: [] });
    }

    const paramsEvo: unknown[] = [];
    let idxEvo = 1;
    let whereEvo = "WHERE 1=1";

    if (vuelta) {
      whereEvo += ` AND pr.circunscripcion = $${idxEvo++}`;
      paramsEvo.push(vuelta);
    }
    if (departamento) {
      whereEvo += ` AND TRIM(pr.codigo_departamento) = $${idxEvo++}`;
      paramsEvo.push(departamento);
    }

    const placeholders = partidoNames.map((_, i) => `$${idxEvo + i}`).join(", ");
    whereEvo += ` AND pr.partido IN (${placeholders})`;
    paramsEvo.push(...partidoNames);

    const rows = await query<{
      anio_eleccion: number;
      partido: string;
      nombre_candidato: string;
      total_votos: string;
    }>(
      `SELECT 
        pr.anio_eleccion,
        pr.partido,
        pr.nombre_candidato,
        SUM(pr.votos) as total_votos
      FROM presidencia_resultados pr
      ${whereEvo}
      GROUP BY pr.anio_eleccion, pr.partido, pr.nombre_candidato
      ORDER BY pr.anio_eleccion, total_votos DESC`,
      paramsEvo
    );

    return NextResponse.json({
      filters: { vuelta, departamento, topN },
      partidos: partidoNames,
      data: rows.map((r) => ({
        anio: r.anio_eleccion,
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
