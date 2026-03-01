"use client";

import { useState } from "react";
import type { BoardImageRecord } from "@/types";

interface ReviewCardProps {
  image: BoardImageRecord;
  selected: boolean;
  note: string;
  onToggleSelect: () => void;
  onNoteChange: (note: string) => void;
}

export default function ReviewCard({
  image,
  selected,
  note,
  onToggleSelect,
  onNoteChange,
}: ReviewCardProps) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div className="space-y-2">
      <button
        onClick={onToggleSelect}
        className={`
          relative w-full aspect-[3/4] overflow-hidden rounded-xl
          border-3 transition-all duration-150
          ${
            selected
              ? "border-green-500 ring-2 ring-green-300 shadow-md"
              : "border-transparent hover:border-gray-300 bg-white shadow-sm"
          }
        `}
      >
        <img
          src={`/api/images/${image.filename}`}
          alt={image.original_name}
          className="w-full h-full object-contain bg-white"
        />
        {selected && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
            <svg
              className="w-5 h-5 text-white"
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
        {image.category && (
          <div className="absolute bottom-1 left-1 right-1 flex justify-center pointer-events-none">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white truncate max-w-full">
              {image.category}
            </span>
          </div>
        )}
      </button>

      {selected && (
        <div className="space-y-1">
          {!showNote && !note ? (
            <button
              onClick={() => setShowNote(true)}
              className="w-full text-xs text-green-700 hover:text-green-800 py-1"
            >
              + Add note
            </button>
          ) : (
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              onFocus={() => setShowNote(true)}
              placeholder="Add a note..."
              rows={2}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-300 resize-none
                focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400
                placeholder:text-gray-400"
            />
          )}
        </div>
      )}
    </div>
  );
}
