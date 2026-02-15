"use client";

import { useCallback, useRef, useState } from "react";

interface ImageUploaderProps {
  onImagesAdded: (files: File[]) => void;
}

export default function ImageUploader({ onImagesAdded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) {
        onImagesAdded(files);
      }
    },
    [onImagesAdded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-colors duration-200
        ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-gray-50"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="space-y-3">
        <div className="text-4xl">📸</div>
        <p className="text-lg font-medium text-gray-700">
          Drop your clothing photos here
        </p>
        <p className="text-sm text-gray-500">
          or click to browse — select as many as you want
        </p>
      </div>
    </div>
  );
}
