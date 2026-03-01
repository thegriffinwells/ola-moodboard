"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { BoardRecord, BoardImageRecord, AnnotationRecord } from "@/types";
import AnnotationOverlay from "@/components/AnnotationOverlay";

interface Props {
  board: BoardRecord;
  images: BoardImageRecord[];
  annotations: AnnotationRecord[];
}

interface PageData {
  sectionLabel: string;
  images: BoardImageRecord[];
  pageInSection: number;
  totalInSection: number;
}

export default function BoardViewClient({ board, images, annotations }: Props) {
  const pagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const annotationMap = useMemo(() => {
    const map = new Map<number, AnnotationRecord>();
    for (const a of annotations) {
      map.set(a.image_id, a);
    }
    return map;
  }, [annotations]);

  const isReviewed = board.status === "reviewed";
  const perPage = board.grid_cols * board.grid_rows;

  const allPages = useMemo<PageData[]>(() => {
    // Group by category
    const hasCategories = images.some((img) => img.category);

    if (!hasCategories) {
      const pages: PageData[] = [];
      for (let i = 0; i < images.length; i += perPage) {
        const pageImages = images.slice(i, i + perPage);
        const totalPages = Math.ceil(images.length / perPage);
        pages.push({
          sectionLabel: board.title || "",
          images: pageImages,
          pageInSection: Math.floor(i / perPage) + 1,
          totalInSection: totalPages,
        });
      }
      return pages;
    }

    const categoryMap = new Map<string, BoardImageRecord[]>();
    const uncategorized: BoardImageRecord[] = [];

    for (const img of images) {
      if (img.category) {
        const list = categoryMap.get(img.category) || [];
        list.push(img);
        categoryMap.set(img.category, list);
      } else {
        uncategorized.push(img);
      }
    }

    const pages: PageData[] = [];
    const sortedCategories = Array.from(categoryMap.keys()).sort();

    for (const cat of sortedCategories) {
      const catImages = categoryMap.get(cat)!;
      const totalPages = Math.ceil(catImages.length / perPage);
      for (let i = 0; i < catImages.length; i += perPage) {
        pages.push({
          sectionLabel: cat,
          images: catImages.slice(i, i + perPage),
          pageInSection: Math.floor(i / perPage) + 1,
          totalInSection: totalPages,
        });
      }
    }

    if (uncategorized.length > 0) {
      const totalPages = Math.ceil(uncategorized.length / perPage);
      for (let i = 0; i < uncategorized.length; i += perPage) {
        pages.push({
          sectionLabel: board.title || "Uncategorized",
          images: uncategorized.slice(i, i + perPage),
          pageInSection: Math.floor(i / perPage) + 1,
          totalInSection: totalPages,
        });
      }
    }

    return pages;
  }, [images, perPage, board.title]);

  const reviewUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/review/${board.id}`
      : `/review/${board.id}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = reviewUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [reviewUrl]);

  const handleSavePdf = useCallback(async () => {
    setSaving(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const pdf = new jsPDF({ orientation: "landscape", unit: "in", format: "letter" });
      const pageWidth = 11;
      const pageHeight = 8.5;

      for (let i = 0; i < pagesRef.current.length; i++) {
        const el = pagesRef.current[i];
        if (!el) continue;

        if (i > 0) pdf.addPage("letter", "landscape");

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);
      }

      const filename = board.title
        ? `${board.title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim()}.pdf`
        : "moodboard.pdf";
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setSaving(false);
    }
  }, [board.title]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-xl font-bold tracking-tight">
                {board.title || "Untitled Board"}
              </h1>
              {isReviewed && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                  Reviewed
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Share Section */}
        <div className="print:hidden bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Share for Review
          </h3>
          <p className="text-xs text-gray-500">
            Send this link to your stylist so they can select their picks and
            add notes.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={reviewUrl}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-600"
            />
            <button
              onClick={handleCopy}
              className="px-5 py-2 rounded-lg bg-black text-white text-sm font-medium
                hover:bg-gray-800 transition-colors shrink-0"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Board Grid */}
        <div className="space-y-8 board-preview">
          <div className="print:hidden text-sm text-gray-500 text-center">
            {images.length} photos across {allPages.length} page
            {allPages.length !== 1 ? "s" : ""} &middot; {board.grid_label}
            {isReviewed && (
              <>
                {" "}&middot;{" "}
                {annotations.filter((a) => a.selected).length} of{" "}
                {images.length} selected by stylist
              </>
            )}
          </div>

          {allPages.map((page, pageIdx) => (
            <div
              key={pageIdx}
              ref={(el) => {
                pagesRef.current[pageIdx] = el;
              }}
              className="board-page bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mx-auto"
              style={{ aspectRatio: "11 / 8.5" }}
            >
              <div className="flex flex-col h-full w-full">
                {page.sectionLabel && (
                  <div className="shrink-0 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-800 tracking-wide uppercase">
                      {page.sectionLabel}
                    </h2>
                    <span className="text-xs text-gray-400">
                      {page.pageInSection} / {page.totalInSection}
                    </span>
                  </div>
                )}
                <div
                  className="grid flex-1 min-h-0"
                  style={{
                    gridTemplateColumns: `repeat(${board.grid_cols}, 1fr)`,
                    gridTemplateRows: `repeat(${board.grid_rows}, 1fr)`,
                  }}
                >
                  {page.images.map((img) => {
                    const annotation = annotationMap.get(img.id);
                    const isSelected = annotation?.selected === 1;
                    const dimmed = isReviewed && !isSelected;

                    return (
                      <div
                        key={img.id}
                        className={`relative overflow-hidden border-[0.5px] border-gray-100 flex items-center justify-center bg-white p-2 transition-opacity ${
                          dimmed ? "opacity-40" : ""
                        }`}
                      >
                        <img
                          src={`/api/images/${img.filename}`}
                          alt={img.original_name}
                          className="max-w-full max-h-full object-contain"
                        />
                        {isReviewed && (
                          <AnnotationOverlay
                            selected={isSelected}
                            note={annotation?.note}
                          />
                        )}
                      </div>
                    );
                  })}
                  {page.images.length < perPage &&
                    Array.from({ length: perPage - page.images.length }).map(
                      (_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="border-[0.5px] border-gray-100 bg-white"
                        />
                      )
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save PDF button */}
        <div className="print:hidden sticky bottom-4 flex justify-center">
          <button
            onClick={handleSavePdf}
            disabled={saving}
            className="px-6 py-3 rounded-full bg-black text-white font-medium text-sm
              hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-wait shadow-lg transition-colors"
          >
            {saving ? "Generating PDF..." : "Save as PDF"}
          </button>
        </div>
      </main>
    </div>
  );
}
