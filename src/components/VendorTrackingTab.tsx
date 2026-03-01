"use client";

import { useCallback, useRef, useState } from "react";
import type { VendorEntry } from "@/types";
import VendorCard from "./VendorCard";
import VendorPdfPreview from "./VendorPdfPreview";

interface VendorTrackingTabProps {
  entries: VendorEntry[];
  projectTitle: string;
  onAddEntry: (vendorName: string, checkInDate: string, files: File[]) => void;
  onCheckOut: (entryId: string, checkOutDate: string, files: File[]) => void;
  onRemoveEntry: (entryId: string) => void;
}

export default function VendorTrackingTab({
  entries,
  projectTitle,
  onAddEntry,
  onCheckOut,
  onRemoveEntry,
}: VendorTrackingTabProps) {
  const [vendorName, setVendorName] = useState("");
  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    const imageFiles = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...imageFiles]);
  }, []);

  const handleSubmit = () => {
    if (!vendorName.trim() || files.length === 0) return;
    onAddEntry(vendorName.trim(), checkInDate, files);
    setVendorName("");
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* Add vendor form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          New Check-In
        </h2>

        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-xs text-gray-500">Vendor Name</label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g. Zara, H&M, Nike..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-400
                placeholder:text-gray-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Check-in Date</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-500">
            Photos {files.length > 0 && `(${files.length})`}
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
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              border-gray-300 hover:border-gray-400 bg-gray-50 transition-colors"
          >
            <p className="text-sm text-gray-500">
              Click to add check-in photos
            </p>
          </div>
          {files.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {files.map((f, i) => (
                <div key={i} className="relative shrink-0">
                  <img
                    src={URL.createObjectURL(f)}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!vendorName.trim() || files.length === 0}
          className="w-full py-3 rounded-lg bg-black text-white font-medium text-sm
            hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Add Check-In
        </button>
      </div>

      {/* Vendor entries list */}
      {entries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Vendor Log ({entries.length})
          </h2>
          {entries.map((entry) => (
            <VendorCard
              key={entry.id}
              entry={entry}
              onCheckOut={onCheckOut}
              onRemove={onRemoveEntry}
            />
          ))}

          <VendorPdfPreview entries={entries} projectTitle={projectTitle} />
        </div>
      )}
    </div>
  );
}
