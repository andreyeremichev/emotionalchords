import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT 1 AS ok;`;
  return NextResponse.json({ ok: true, rows });
}