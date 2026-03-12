import { NextRequest, NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const anio = searchParams.get("anio");
  const vuelta = searchParams.get("vuelta");
  const candidato1 = searchParams.get("candidato1");
  const candidato2 = searchParams.get("candidato2");

  if (!candidato1 || !candidato2) {
    return NextResponse.json(
      { error: "Se requieren candidato1 y candidato2" },
      { status: 400 }
    );
  }

  try {
    let where = "WHERE 1=1";
    const params: unknown[] = [];
    let idx = 1;

    if (anio) { where += ` AND pr.anio_eleccion = $${idx++}`; params.push(Number(anio)); }
    if (vuelta) { where += ` AND pr.circunscripcion = $${idx++}`; params.push(vuelta); }

    params.push(candidato1, candidato2);

    const rows = await query<{
      departamento: string;
      codigo_departamento: string;
      candidato: string;
      votos: string;
    }>(
      `SELECT 
        COALESCE(d.nombre, 'N/A') as departamento,
        TRIM(pr.codigo_departamento) as codigo_departamento,
        pr.nombre_candidato as candidato,
        SUM(pr.votos) as votos
      FROM presidencia_resultados pr
      LEFT JOIN divi_departamentos d ON TRIM(pr.codigo_departamento) = d.codigo_departamento
      ${where}
      AND pr.nombre_candidato IN ($${idx}, $${idx + 1})
      GROUP BY TRIM(pr.codigo_departamento), d.nombre, pr.nombre_candidato
      ORDER BY d.nombre, pr.nombre_candidato`,
      params
    );

    const departamentos = [...new Set(rows.map((r) => r.departamento))].sort();
    const comparison = departamentos.map((dept) => {
      const v1 = rows.find((r) => r.departamento === dept && r.candidato === candidato1);
      const v2 = rows.find((r) => r.departamento === dept && r.candidato === candidato2);
      const votos1 = Number(v1?.votos ?? 0);
      const votos2 = Number(v2?.votos ?? 0);
      return {
        departamento: dept,
        [candidato1]: votos1,
        [candidato2]: votos2,
        diferencia: votos1 - votos2,
        ganador: votos1 > votos2 ? candidato1 : votos2 > votos1 ? candidato2 : "Empate",
      };
    });

    const totalC1 = comparison.reduce((s, c) => s + (c[candidato1] as number), 0);
    const totalC2 = comparison.reduce((s, c) => s + (c[candidato2] as number), 0);
    const deptsC1 = comparison.filter((c) => c.ganador === candidato1).length;
    const deptsC2 = comparison.filter((c) => c.ganador === candidato2).length;

    return NextResponse.json({
      candidato1: { nombre: candidato1, totalVotos: totalC1, deptsGanados: deptsC1 },
      candidato2: { nombre: candidato2, totalVotos: totalC2, deptsGanados: deptsC2 },
      porDepartamento: comparison,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
