"use client";

import { useState } from "react";

interface CategoryAssignerProps {
  selectedIds: Set<string>;
  existingCategories: string[];
  onAssignCategory: (ids: string[], category: string) => void;
  onRemoveCategory: (ids: string[]) => void;
}

export default function CategoryAssigner({
  selectedIds,
  existingCategories,
  onAssignCategory,
  onRemoveCategory,
}: CategoryAssignerProps) {
  const [value, setValue] = useState("");

  const ids = Array.from(selectedIds);

  const handleAssign = () => {
    const trimmed = value.trim();
    if (trimmed && ids.length > 0) {
      onAssignCategory(ids, trimmed);
      setValue("");
    }
  };

  if (ids.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Assign Category
      </h3>
      <p className="text-xs text-gray-500">
        Assign a category to the {ids.length} selected photo{ids.length !== 1 ? "s" : ""}.
        Categories group images into separate sections in the board.
      </p>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            list="category-options"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAssign();
            }}
            placeholder="e.g. Shoes, Tops, Accessories..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm
              focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-400
              placeholder:text-gray-400"
          />
          <datalist id="category-options">
            {existingCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
        <button
          onClick={handleAssign}
          disabled={!value.trim()}
          className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium
            hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Assign
        </button>
        <button
          onClick={() => onRemoveCategory(ids)}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium
            hover:bg-gray-200 transition-colors"
        >
          Clear
        </button>
      </div>
      {existingCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {existingCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (ids.length > 0) onAssignCategory(ids, cat);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
