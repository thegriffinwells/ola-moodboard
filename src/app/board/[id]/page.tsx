import db from "@/lib/db";
import type { BoardRecord, BoardImageRecord, AnnotationRecord } from "@/types";
import { notFound } from "next/navigation";
import BoardViewClient from "./BoardViewClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: Props) {
  const { id } = await params;

  const board = db
    .prepare("SELECT * FROM boards WHERE id = ?")
    .get(id) as BoardRecord | undefined;

  if (!board) notFound();

  const images = db
    .prepare("SELECT * FROM board_images WHERE board_id = ? ORDER BY sort_order")
    .all(id) as BoardImageRecord[];

  const annotations = db
    .prepare("SELECT * FROM annotations WHERE board_id = ?")
    .all(id) as AnnotationRecord[];

  return (
    <BoardViewClient
      board={board}
      images={images}
      annotations={annotations}
    />
  );
}
