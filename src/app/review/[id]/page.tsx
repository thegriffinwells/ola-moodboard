import db from "@/lib/db";
import type { BoardRecord, BoardImageRecord } from "@/types";
import { notFound } from "next/navigation";
import ReviewClient from "./ReviewClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: Props) {
  const { id } = await params;

  const board = db
    .prepare("SELECT * FROM boards WHERE id = ?")
    .get(id) as BoardRecord | undefined;

  if (!board) notFound();

  const images = db
    .prepare("SELECT * FROM board_images WHERE board_id = ? ORDER BY sort_order")
    .all(id) as BoardImageRecord[];

  return <ReviewClient board={board} images={images} />;
}
