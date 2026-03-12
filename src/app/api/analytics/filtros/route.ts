import { NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [anios, vueltas, partidos, departamentos] = await Promise.all([
      query<{ anio_eleccion: number }>(
        `SELECT DISTINCT anio_eleccion FROM presidencia_resultados ORDER BY anio_eleccion`
      ),
      query<{ circunscripcion: string }>(
        `SELECT DISTINCT circunscripcion FROM presidencia_resultados ORDER BY circunscripcion`
      ),
      query<{ partido: string }>(
        `SELECT DISTINCT partido FROM presidencia_resultados ORDER BY partido`
      ),
      query<{ codigo_departamento: string; nombre: string }>(
        `SELECT d.codigo_departamento, d.nombre 
         FROM divi_departamentos d
         WHERE EXISTS (
           SELECT 1 FROM presidencia_resultados pr 
           WHERE TRIM(pr.codigo_departamento) = d.codigo_departamento
         )
         ORDER BY d.nombre`
      ),
    ]);

    return NextResponse.json({
      anios: anios.map((r) => r.anio_eleccion),
      vueltas: vueltas.map((r) => r.circunscripcion),
      partidos: partidos.map((r) => r.partido),
      departamentos: departamentos.map((r) => ({
        codigo: r.codigo_departamento,
        nombre: r.nombre,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
