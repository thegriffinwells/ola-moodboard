"use client";

import { useCallback, useState } from "react";
import type { BoardRecord, BoardImageRecord } from "@/types";
import ReviewCard from "@/components/ReviewCard";

interface Props {
  board: BoardRecord;
  images: BoardImageRecord[];
}

interface ImageAnnotation {
  selected: boolean;
  note: string;
}

export default function ReviewClient({ board, images }: Props) {
  const [state, setState] = useState<Map<number, ImageAnnotation>>(() => {
    const map = new Map<number, ImageAnnotation>();
    for (const img of images) {
      map.set(img.id, { selected: false, note: "" });
    }
    return map;
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedCount = Array.from(state.values()).filter(
    (a) => a.selected
  ).length;

  const toggleSelect = useCallback((imageId: number) => {
    setState((prev) => {
      const next = new Map(prev);
      const current = next.get(imageId)!;
      next.set(imageId, { ...current, selected: !current.selected });
      return next;
    });
  }, []);

  const setNote = useCallback((imageId: number, note: string) => {
    setState((prev) => {
      const next = new Map(prev);
      const current = next.get(imageId)!;
      next.set(imageId, { ...current, note });
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const annotations = Array.from(state.entries()).map(
        ([imageId, { selected, note }]) => ({
          imageId,
          selected,
          note,
        })
      );

      const res = await fetch(`/api/boards/${board.id}/annotations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annotations }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [state, board.id]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Review Submitted!</h2>
          <p className="text-gray-500 text-sm">
            You selected {selectedCount} of {images.length} photos. Your
            assistant will see your picks and notes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Sticky top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              {board.title || "Moodboard Review"}
            </h1>
            <p className="text-xs text-gray-500">
              {images.length} photos &middot; Tap to select your picks
            </p>
          </div>
        </div>
      </header>

      {/* Image grid */}
      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img) => {
            const annotation = state.get(img.id)!;
            return (
              <ReviewCard
                key={img.id}
                image={img}
                selected={annotation.selected}
                note={annotation.note}
                onToggleSelect={() => toggleSelect(img.id)}
                onNoteChange={(note) => setNote(img.id, note)}
              />
            );
          })}
        </div>
      </main>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            {selectedCount} of {images.length} selected
          </span>
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedCount === 0}
            className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium
              hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
