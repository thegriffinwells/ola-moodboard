"use client";

import { useMemo } from "react";
import type { ImageItem } from "./ImageGallery";
import type { GridConfig } from "./GridSizePicker";

interface BoardPreviewProps {
  images: ImageItem[];
  gridConfig: GridConfig;
}

export default function BoardPreview({
  images,
  gridConfig,
}: BoardPreviewProps) {
  const perPage = gridConfig.cols * gridConfig.rows;

  const pages = useMemo(() => {
    const result: ImageItem[][] = [];
    for (let i = 0; i < images.length; i += perPage) {
      result.push(images.slice(i, i + perPage));
    }
    return result;
  }, [images, perPage]);

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
          className="board-page bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          style={{ aspectRatio: "8.5 / 11" }}
        >
          <div
            className="grid h-full w-full p-2 gap-2"
            style={{
              gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
              gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
            }}
          >
            {pageImages.map((img) => (
              <div
                key={img.id}
                className="relative overflow-hidden rounded bg-gray-100"
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {/* Fill empty cells on last page */}
            {pageImages.length < perPage &&
              Array.from({ length: perPage - pageImages.length }).map(
                (_, i) => (
                  <div key={`empty-${i}`} className="bg-gray-50 rounded" />
                )
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
