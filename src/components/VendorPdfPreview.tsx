"use client";

import { useCallback, useRef, useState } from "react";
import type { VendorEntry } from "@/types";

interface VendorPdfPreviewProps {
  entries: VendorEntry[];
  projectTitle: string;
}

export default function VendorPdfPreview({ entries, projectTitle }: VendorPdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSavePdf = useCallback(async () => {
    if (!containerRef.current) return;
    setSaving(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: "letter" });
      const pageWidth = 8.5;
      const pageHeight = 11;

      // Render each vendor card as a separate page
      const cards = containerRef.current.querySelectorAll<HTMLDivElement>("[data-vendor-card]");
      for (let i = 0; i < cards.length; i++) {
        if (i > 0) pdf.addPage("letter", "portrait");

        const canvas = await html2canvas(cards[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
      }

      const filename = projectTitle
        ? `${projectTitle.replace(/[^a-zA-Z0-9-_ ]/g, "").trim()} - Vendor Log.pdf`
        : "vendor-log.pdf";
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setSaving(false);
    }
  }, [projectTitle]);

  if (entries.length === 0) return null;

  return (
    <div className="space-y-4">
      <button
        onClick={handleSavePdf}
        disabled={saving}
        className="w-full py-3 rounded-lg bg-black text-white font-medium text-sm
          hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-wait transition-colors"
      >
        {saving ? "Generating PDF..." : "Export Vendor Log as PDF"}
      </button>

      {/* Hidden render container for PDF */}
      <div ref={containerRef} className="sr-only" aria-hidden="true">
        {entries.map((entry) => (
          <div
            key={entry.id}
            data-vendor-card
            className="bg-white p-8 space-y-6"
            style={{ width: "816px", minHeight: "1056px" }}
          >
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
              {projectTitle && (
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {projectTitle}
                </p>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{entry.vendorName}</h2>
              <div className="flex gap-6 mt-2 text-sm text-gray-600">
                <span>Check-in: {entry.checkInDate}</span>
                {entry.checkOutDate && <span>Check-out: {entry.checkOutDate}</span>}
                <span
                  className={`font-medium ${
                    entry.checkOutDate ? "text-green-700" : "text-yellow-700"
                  }`}
                >
                  {entry.checkOutDate ? "Returned" : "Checked In"}
                </span>
              </div>
            </div>

            {/* Check-in photos */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Check-in Photos
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {entry.checkInPhotos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt=""
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>

            {/* Check-out photos */}
            {entry.checkOutDate && entry.checkOutPhotos.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Check-out Photos
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {entry.checkOutPhotos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt=""
                      className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
