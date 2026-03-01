import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const results: { url: string; originalName: string }[] = [];

  for (const file of files) {
    const blob = await put(file.name, file, { access: "public" });
    results.push({ url: blob.url, originalName: file.name });
  }

  return NextResponse.json({ files: results });
}
