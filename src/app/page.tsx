"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [reviewLink, setReviewLink] = useState("");

  const handleStylistGo = () => {
    const trimmed = reviewLink.trim();
    if (!trimmed) return;

    // Accept full URLs or just the path/ID
    if (trimmed.startsWith("http")) {
      try {
        const url = new URL(trimmed);
        router.push(url.pathname);
      } catch {
        return;
      }
    } else if (trimmed.startsWith("/")) {
      router.push(trimmed);
    } else {
      // Assume it's just the board ID
      router.push(`/review/${trimmed}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Ola Moodboard</h1>
          <p className="text-gray-500">Choose your role to get started</p>
        </div>

        <div className="space-y-4">
          {/* Assistant Button */}
          <button
            onClick={() => router.push("/create")}
            className="w-full p-6 bg-white rounded-xl border-2 border-gray-200
              hover:border-black hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold group-hover:text-black">
                I&apos;m the Assistant
              </span>
              <span className="text-2xl">&#8594;</span>
            </div>
            <p className="text-sm text-gray-500">
              Upload photos, build moodboards, and share them with your stylist
              for review.
            </p>
          </button>

          {/* Stylist Section */}
          <div
            className="w-full p-6 bg-white rounded-xl border-2 border-gray-200
              space-y-4"
          >
            <div>
              <span className="text-lg font-semibold">
                I&apos;m the Stylist
              </span>
              <p className="text-sm text-gray-500 mt-1">
                Paste the review link your assistant shared with you.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={reviewLink}
                onChange={(e) => setReviewLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStylistGo();
                }}
                placeholder="Paste review link or board ID..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm
                  focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-400
                  placeholder:text-gray-400"
              />
              <button
                onClick={handleStylistGo}
                disabled={!reviewLink.trim()}
                className="px-5 py-2 rounded-lg bg-black text-white text-sm font-medium
                  hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
