import { NextRequest, NextResponse } from "next/server";
import { query, DB_SCHEMA } from "@infrastructure/config/database";

type TableExists = Record<string, unknown> & { exists: boolean };
type ColumnInfo = Record<string, unknown> & { column_name: string; data_type: string; is_nullable: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: tableName } = await params;

  const { searchParams } = request.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 1000);
  const offset = Number(searchParams.get("offset") ?? 0);

  try {
    const tableCheck = await query<TableExists>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = $2
      ) as exists`,
      [DB_SCHEMA, tableName]
    );

    if (!tableCheck[0]?.exists) {
      return NextResponse.json(
        { error: `Table "${tableName}" not found in schema "${DB_SCHEMA}"` },
        { status: 404 }
      );
    }

    const columns = await query<ColumnInfo>(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2
       ORDER BY ordinal_position`,
      [DB_SCHEMA, tableName]
    );

    const countResult = await query<{ total: string }>(
      `SELECT COUNT(*) as total FROM "${DB_SCHEMA}"."${tableName}"`
    );
    const total = Number(countResult[0].total);

    const rows = await query(
      `SELECT * FROM "${DB_SCHEMA}"."${tableName}" LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return NextResponse.json({
      table: tableName,
      schema: DB_SCHEMA,
      columns,
      total,
      limit,
      offset,
      data: rows,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
