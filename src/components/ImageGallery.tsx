"use client";

import { useMemo, useState } from "react";
import type { ImageItem } from "@/types";

export type { ImageItem };

interface ImageGalleryProps {
  images: ImageItem[];
  selectedIds: Set<string>;
  categories?: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRemoveImage: (id: string) => void;
}

export default function ImageGallery({
  images,
  selectedIds,
  categories = [],
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onRemoveImage,
}: ImageGalleryProps) {
  const [filter, setFilter] = useState<"all" | "selected" | "unselected">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let result = images;

    if (filter === "selected")
      result = result.filter((img) => selectedIds.has(img.id));
    else if (filter === "unselected")
      result = result.filter((img) => !selectedIds.has(img.id));

    if (categoryFilter === "uncategorized")
      result = result.filter((img) => !img.category);
    else if (categoryFilter !== "all")
      result = result.filter((img) => img.category === categoryFilter);

    return result;
  }, [images, selectedIds, filter, categoryFilter]);

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
        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg border border-gray-300 bg-white text-gray-700
                focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <option value="all">All categories</option>
              <option value="uncategorized">Uncategorized</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
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
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {filtered.map((img) => {
          const isSelected = selectedIds.has(img.id);
          return (
            <div key={img.id} className="relative group">
              <button
                onClick={() => onToggleSelect(img.id)}
                className={`
                  relative w-full aspect-[3/4] overflow-hidden rounded-lg
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
                  className="w-full h-full object-contain"
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
              {img.category && (
                <div className="absolute bottom-1 left-1 right-1 flex justify-center pointer-events-none">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white truncate max-w-full">
                    {img.category}
                  </span>
                </div>
              )}
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
