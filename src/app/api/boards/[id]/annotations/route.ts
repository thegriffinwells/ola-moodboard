import { NextResponse } from "next/server";
import db from "@/lib/db";
import type { BoardRecord } from "@/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const board = db
    .prepare(`SELECT * FROM boards WHERE id = ?`)
    .get(id) as BoardRecord | undefined;

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const { annotations } = (await request.json()) as {
    annotations: { imageId: number; selected: boolean; note: string }[];
  };

  const upsert = db.prepare(`
    INSERT INTO annotations (board_id, image_id, selected, note)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(board_id, image_id) DO UPDATE SET
      selected = excluded.selected,
      note = excluded.note,
      created_at = datetime('now')
  `);

  const updateStatus = db.prepare(
    `UPDATE boards SET status = 'reviewed' WHERE id = ?`
  );

  const transaction = db.transaction(() => {
    for (const a of annotations) {
      upsert.run(id, a.imageId, a.selected ? 1 : 0, a.note);
    }
    updateStatus.run(id);
  });

  transaction();

  return NextResponse.json({ success: true });
}
