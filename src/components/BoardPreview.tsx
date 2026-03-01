"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ImageItem, AnnotationRecord } from "@/types";
import type { GridConfig } from "@/types";
import AnnotationOverlay from "@/components/AnnotationOverlay";

interface BoardPreviewProps {
  images: ImageItem[];
  gridConfig: GridConfig;
  projectTitle: string;
  annotations?: AnnotationRecord[];
  imageUrlPrefix?: string;
}

interface Section {
  label: string;
  images: ImageItem[];
}

export default function BoardPreview({
  images,
  gridConfig,
  projectTitle,
  annotations,
  imageUrlPrefix,
}: BoardPreviewProps) {
  const annotationMap = useMemo(() => {
    if (!annotations) return null;
    const map = new Map<string, AnnotationRecord>();
    for (const a of annotations) {
      map.set(String(a.image_id), a);
    }
    return map;
  }, [annotations]);
  const perPage = gridConfig.cols * gridConfig.rows;
  const pagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [saving, setSaving] = useState(false);

  // Group images by category into sections
  const sections = useMemo<Section[]>(() => {
    const hasAnyCategory = images.some((img) => img.category);
    if (!hasAnyCategory) {
      // No categories assigned — single section, use project title
      return [{ label: projectTitle, images }];
    }

    const categoryMap = new Map<string, ImageItem[]>();
    const uncategorized: ImageItem[] = [];

    for (const img of images) {
      if (img.category) {
        const list = categoryMap.get(img.category) || [];
        list.push(img);
        categoryMap.set(img.category, list);
      } else {
        uncategorized.push(img);
      }
    }

    const result: Section[] = [];
    // Sort categories alphabetically
    const sortedCategories = Array.from(categoryMap.keys()).sort();
    for (const cat of sortedCategories) {
      result.push({ label: cat, images: categoryMap.get(cat)! });
    }
    if (uncategorized.length > 0) {
      result.push({ label: projectTitle || "Uncategorized", images: uncategorized });
    }
    return result;
  }, [images, projectTitle]);

  // Flatten all pages across sections for PDF export
  const allPages = useMemo(() => {
    const pages: { sectionLabel: string; images: ImageItem[]; pageInSection: number; totalInSection: number }[] = [];
    for (const section of sections) {
      const sectionPages: ImageItem[][] = [];
      for (let i = 0; i < section.images.length; i += perPage) {
        sectionPages.push(section.images.slice(i, i + perPage));
      }
      sectionPages.forEach((pageImages, idx) => {
        pages.push({
          sectionLabel: section.label,
          images: pageImages,
          pageInSection: idx + 1,
          totalInSection: sectionPages.length,
        });
      });
    }
    return pages;
  }, [sections, perPage]);

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

      const filename = projectTitle
        ? `${projectTitle.replace(/[^a-zA-Z0-9-_ ]/g, "").trim()}.pdf`
        : "moodboard.pdf";
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
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
        {images.length} photos across {allPages.length} page
        {allPages.length !== 1 ? "s" : ""} &middot; {gridConfig.label}
        {sections.length > 1 && (
          <> &middot; {sections.length} categories</>
        )}
      </div>

      {allPages.map((page, pageIdx) => (
        <div
          key={pageIdx}
          ref={(el) => { pagesRef.current[pageIdx] = el; }}
          className="board-page bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mx-auto"
          style={{ aspectRatio: "11 / 8.5" }}
        >
          <div className="flex flex-col h-full w-full">
            {/* Page title bar — shows category name or project title */}
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
            {/* Image grid */}
            <div
              className="grid flex-1 min-h-0"
              style={{
                gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
                gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
              }}
            >
              {page.images.map((img) => (
                <div
                  key={img.id}
                  className={`relative overflow-hidden border-[0.5px] border-gray-100 flex items-center justify-center bg-white p-2 ${
                    annotationMap && !annotationMap.get(img.id)?.selected ? "opacity-40" : ""
                  }`}
                >
                  <img
                    src={imageUrlPrefix ? `${imageUrlPrefix}/${img.id}` : img.url}
                    alt=""
                    className="max-w-full max-h-full object-contain"
                  />
                  {annotationMap && (
                    <AnnotationOverlay
                      selected={annotationMap.get(img.id)?.selected === 1}
                      note={annotationMap.get(img.id)?.note}
                    />
                  )}
                </div>
              ))}
              {/* Fill empty cells on last page of section */}
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
