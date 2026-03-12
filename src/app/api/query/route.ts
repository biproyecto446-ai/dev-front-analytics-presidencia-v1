import { NextRequest, NextResponse } from "next/server";
import { query } from "@infrastructure/config/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sql, params } = body as { sql?: string; params?: unknown[] };

    if (!sql) {
      return NextResponse.json(
        { error: "Missing 'sql' field in request body" },
        { status: 400 }
      );
    }

    const forbidden = /\b(DROP|DELETE|TRUNCATE|ALTER|INSERT|UPDATE|CREATE)\b/i;
    if (forbidden.test(sql)) {
      return NextResponse.json(
        { error: "Only SELECT queries are allowed" },
        { status: 403 }
      );
    }

    const rows = await query(sql, params);

    return NextResponse.json({
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
