import { NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export async function GET() {
  try {
    const rows = await query<{ now: string }>("SELECT NOW() as now");
    return NextResponse.json({
      status: "ok",
      database: "connected",
      serverTime: rows[0].now,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", database: "disconnected", message },
      { status: 500 }
    );
  }
}
