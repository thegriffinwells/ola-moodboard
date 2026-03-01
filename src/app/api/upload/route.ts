import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function POST(request: Request) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const results: { filename: string; originalName: string }[] = [];

  for (const file of files) {
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${nanoid()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
    results.push({ filename, originalName: file.name });
  }

  return NextResponse.json({ files: results });
}
