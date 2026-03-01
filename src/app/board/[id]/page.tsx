import { getDb } from "@/lib/db";
import type { BoardRecord, BoardImageRecord, AnnotationRecord } from "@/types";
import { notFound } from "next/navigation";
import BoardViewClient from "./BoardViewClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: Props) {
  const { id } = await params;
  const db = await getDb();

  const boardResult = await db.execute({
    sql: "SELECT * FROM boards WHERE id = ?",
    args: [id],
  });

  if (boardResult.rows.length === 0) notFound();

  const board = boardResult.rows[0] as unknown as BoardRecord;

  const imagesResult = await db.execute({
    sql: "SELECT * FROM board_images WHERE board_id = ? ORDER BY sort_order",
    args: [id],
  });
  const images = imagesResult.rows as unknown as BoardImageRecord[];

  const annotationsResult = await db.execute({
    sql: "SELECT * FROM annotations WHERE board_id = ?",
    args: [id],
  });
  const annotations = annotationsResult.rows as unknown as AnnotationRecord[];

  return (
    <BoardViewClient
      board={board}
      images={images}
      annotations={annotations}
    />
  );
}
