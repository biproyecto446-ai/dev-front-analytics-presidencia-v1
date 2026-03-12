import { NextResponse } from "next/server";
import { query, DB_SCHEMA } from "@infrastructure/config/database";

interface TableInfo {
  table_name: string;
  table_type: string;
}

export async function GET() {
  try {
    const tables = await query<TableInfo>(
      `SELECT table_name, table_type 
       FROM information_schema.tables 
       WHERE table_schema = $1 
       ORDER BY table_name`,
      [DB_SCHEMA]
    );

    return NextResponse.json({
      schema: DB_SCHEMA,
      count: tables.length,
      tables,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
