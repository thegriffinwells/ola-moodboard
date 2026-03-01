import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();

  const boardResult = await db.execute({
    sql: `SELECT * FROM boards WHERE id = ?`,
    args: [id],
  });

  if (boardResult.rows.length === 0) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const board = boardResult.rows[0];

  const imagesResult = await db.execute({
    sql: `SELECT * FROM board_images WHERE board_id = ? ORDER BY sort_order`,
    args: [id],
  });

  const annotationsResult = await db.execute({
    sql: `SELECT * FROM annotations WHERE board_id = ?`,
    args: [id],
  });

  return NextResponse.json({
    ...board,
    images: imagesResult.rows,
    annotations: annotationsResult.rows,
  });
}
