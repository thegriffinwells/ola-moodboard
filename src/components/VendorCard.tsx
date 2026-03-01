"use client";

import { useCallback, useRef, useState } from "react";
import type { VendorEntry } from "@/types";

interface VendorCardProps {
  entry: VendorEntry;
  onCheckOut: (entryId: string, checkOutDate: string, files: File[]) => void;
  onRemove: (entryId: string) => void;
}

export default function VendorCard({ entry, onCheckOut, onRemove }: VendorCardProps) {
  const [checkOutDate, setCheckOutDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [checkOutFiles, setCheckOutFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    setCheckOutFiles((prev) => [...prev, ...files]);
  }, []);

  const handleCheckOut = () => {
    onCheckOut(entry.id, checkOutDate, checkOutFiles);
    setCheckOutFiles([]);
  };

  const isCheckedOut = !!entry.checkOutDate;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{entry.vendorName}</h3>
          <p className="text-xs text-gray-500">
            Checked in: {entry.checkInDate}
            {isCheckedOut && <> &middot; Checked out: {entry.checkOutDate}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isCheckedOut
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {isCheckedOut ? "Returned" : "Checked In"}
          </span>
          <button
            onClick={() => onRemove(entry.id)}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Check-in photos */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Check-in Photos</p>
        <div className="flex gap-2 overflow-x-auto">
          {entry.checkInPhotos.map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt=""
              className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Check-out section */}
      {isCheckedOut ? (
        entry.checkOutPhotos.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Check-out Photos</p>
            <div className="flex gap-2 overflow-x-auto">
              {entry.checkOutPhotos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0"
                />
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="space-y-3 border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Check Out</p>
          <div className="flex gap-2 items-end flex-wrap">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Date</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm
                  focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">
                Photos {checkOutFiles.length > 0 && `(${checkOutFiles.length})`}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600
                  hover:bg-gray-50 transition-colors"
              >
                Add Photos
              </button>
            </div>
            <button
              onClick={handleCheckOut}
              className="px-4 py-1.5 rounded-lg bg-black text-white text-sm font-medium
                hover:bg-gray-800 transition-colors"
            >
              Complete Check-out
            </button>
          </div>
          {checkOutFiles.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {checkOutFiles.map((f, i) => (
                <div key={i} className="relative shrink-0">
                  <img
                    src={URL.createObjectURL(f)}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => setCheckOutFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
