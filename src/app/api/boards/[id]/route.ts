import { NextResponse } from "next/server";
import db from "@/lib/db";
import type { BoardRecord, BoardImageRecord, AnnotationRecord } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const board = db
    .prepare(`SELECT * FROM boards WHERE id = ?`)
    .get(id) as BoardRecord | undefined;

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const images = db
    .prepare(`SELECT * FROM board_images WHERE board_id = ? ORDER BY sort_order`)
    .all(id) as BoardImageRecord[];

  const annotations = db
    .prepare(`SELECT * FROM annotations WHERE board_id = ?`)
    .all(id) as AnnotationRecord[];

  return NextResponse.json({ ...board, images, annotations });
}
