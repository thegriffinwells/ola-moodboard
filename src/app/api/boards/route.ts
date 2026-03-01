import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { title, gridCols, gridRows, gridLabel, images } = body as {
    title: string;
    gridCols: number;
    gridRows: number;
    gridLabel: string;
    images: { url: string; originalName: string; category?: string }[];
  };

  const id = nanoid(10);
  const db = await getDb();

  const statements = [
    {
      sql: `INSERT INTO boards (id, title, grid_cols, grid_rows, grid_label) VALUES (?, ?, ?, ?, ?)`,
      args: [id, title || "", gridCols, gridRows, gridLabel],
    },
    ...images.map((img, idx) => ({
      sql: `INSERT INTO board_images (board_id, filename, original_name, category, sort_order) VALUES (?, ?, ?, ?, ?)`,
      args: [id, img.url, img.originalName, img.category || null, idx],
    })),
  ];

  await db.batch(statements, "write");

  return NextResponse.json({ id });
}
