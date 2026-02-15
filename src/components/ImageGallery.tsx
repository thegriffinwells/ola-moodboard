"use client";

import { useEffect, useMemo, useState } from "react";

export interface ImageItem {
  id: string;
  file: File;
  url: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRemoveImage: (id: string) => void;
}

export default function ImageGallery({
  images,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onRemoveImage,
}: ImageGalleryProps) {
  const [filter, setFilter] = useState<"all" | "selected" | "unselected">(
    "all"
  );

  const filtered = useMemo(() => {
    if (filter === "selected")
      return images.filter((img) => selectedIds.has(img.id));
    if (filter === "unselected")
      return images.filter((img) => !selectedIds.has(img.id));
    return images;
  }, [images, selectedIds, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            {selectedIds.size} of {images.length} selected
          </span>
          <button
            onClick={onSelectAll}
            className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Select All
          </button>
          <button
            onClick={onDeselectAll}
            className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Deselect All
          </button>
        </div>
        <div className="flex gap-1">
          {(["all", "selected", "unselected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full capitalize ${
                filter === f
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {filtered.map((img) => {
          const isSelected = selectedIds.has(img.id);
          return (
            <div key={img.id} className="relative group">
              <button
                onClick={() => onToggleSelect(img.id)}
                className={`
                  relative w-full aspect-square overflow-hidden rounded-lg
                  border-3 transition-all duration-150
                  ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-300"
                      : "border-transparent hover:border-gray-300"
                  }
                `}
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(img.id);
                }}
                className="absolute top-1 left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
