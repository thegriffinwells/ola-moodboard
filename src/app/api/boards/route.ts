import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import db from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { title, gridCols, gridRows, gridLabel, images } = body as {
    title: string;
    gridCols: number;
    gridRows: number;
    gridLabel: string;
    images: { filename: string; originalName: string; category?: string }[];
  };

  const id = nanoid(10);

  const insertBoard = db.prepare(
    `INSERT INTO boards (id, title, grid_cols, grid_rows, grid_label) VALUES (?, ?, ?, ?, ?)`
  );

  const insertImage = db.prepare(
    `INSERT INTO board_images (board_id, filename, original_name, category, sort_order) VALUES (?, ?, ?, ?, ?)`
  );

  const transaction = db.transaction(() => {
    insertBoard.run(id, title || "", gridCols, gridRows, gridLabel);
    images.forEach((img, idx) => {
      insertImage.run(id, img.filename, img.originalName, img.category || null, idx);
    });
  });

  transaction();

  return NextResponse.json({ id });
}
