"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ImageItem } from "./ImageGallery";
import type { GridConfig } from "./GridSizePicker";

interface BoardPreviewProps {
  images: ImageItem[];
  gridConfig: GridConfig;
  projectTitle: string;
}

export default function BoardPreview({
  images,
  gridConfig,
  projectTitle,
}: BoardPreviewProps) {
  const perPage = gridConfig.cols * gridConfig.rows;
  const pagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [saving, setSaving] = useState(false);

  const pages = useMemo(() => {
    const result: ImageItem[][] = [];
    for (let i = 0; i < images.length; i += perPage) {
      result.push(images.slice(i, i + perPage));
    }
    return result;
  }, [images, perPage]);

  const handleSavePdf = useCallback(async () => {
    setSaving(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      // Landscape letter: 11 x 8.5 inches
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

      const filename = projectTitle
        ? `${projectTitle.replace(/[^a-zA-Z0-9-_ ]/g, "").trim()}.pdf`
        : "moodboard.pdf";
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
      // Fallback to browser print
      window.print();
    } finally {
      setSaving(false);
    }
  }, [projectTitle]);

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No images selected. Go back and select some photos.
      </div>
    );
  }

  return (
    <div className="space-y-8 board-preview">
      <div className="print:hidden text-sm text-gray-500 text-center">
        {images.length} photos across {pages.length} page
        {pages.length !== 1 ? "s" : ""} &middot; {gridConfig.label}
      </div>

      {pages.map((pageImages, pageIdx) => (
        <div
          key={pageIdx}
          ref={(el) => { pagesRef.current[pageIdx] = el; }}
          className="board-page bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mx-auto"
          style={{ aspectRatio: "11 / 8.5" }}
        >
          <div className="flex flex-col h-full w-full">
            {/* Page title bar */}
            {projectTitle && (
              <div className="shrink-0 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 tracking-wide uppercase">
                  {projectTitle}
                </h2>
                <span className="text-xs text-gray-400">
                  {pageIdx + 1} / {pages.length}
                </span>
              </div>
            )}
            {/* Image grid */}
            <div
              className="grid flex-1 min-h-0"
              style={{
                gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
                gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
              }}
            >
              {pageImages.map((img) => (
                <div
                  key={img.id}
                  className="relative overflow-hidden border-[0.5px] border-gray-100 flex items-center justify-center bg-white p-2"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
              {/* Fill empty cells on last page */}
              {pageImages.length < perPage &&
                Array.from({ length: perPage - pageImages.length }).map(
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

      {/* Save PDF button (fixed bottom bar) */}
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
    </div>
  );
}
