import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PUT(
  request: Request,
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

  const { annotations } = (await request.json()) as {
    annotations: { imageId: number; selected: boolean; note: string }[];
  };

  const statements = [
    ...annotations.map((a) => ({
      sql: `INSERT INTO annotations (board_id, image_id, selected, note)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(board_id, image_id) DO UPDATE SET
              selected = excluded.selected,
              note = excluded.note,
              created_at = datetime('now')`,
      args: [id, a.imageId, a.selected ? 1 : 0, a.note],
    })),
    {
      sql: `UPDATE boards SET status = 'reviewed' WHERE id = ?`,
      args: [id],
    },
  ];

  await db.batch(statements, "write");

  return NextResponse.json({ success: true });
}
