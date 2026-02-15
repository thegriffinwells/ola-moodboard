"use client";

import { useCallback, useMemo, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import ImageGallery, { type ImageItem } from "@/components/ImageGallery";
import GridSizePicker, { type GridConfig } from "@/components/GridSizePicker";
import BoardPreview from "@/components/BoardPreview";

type Step = "upload" | "board";

let nextId = 0;

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    cols: 3,
    rows: 1,
    label: "3 per page",
  });
  const [step, setStep] = useState<Step>("upload");
  const [projectTitle, setProjectTitle] = useState("");

  const handleImagesAdded = useCallback((files: File[]) => {
    const newImages: ImageItem[] = files.map((file) => ({
      id: `img-${nextId++}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    // Auto-select newly added images
    setSelectedIds((prev) => {
      const next = new Set(prev);
      newImages.forEach((img) => next.add(img.id));
      return next;
    });
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(images.map((img) => img.id)));
  }, [images]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleRemoveImage = useCallback(
    (id: string) => {
      const img = images.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      setImages((prev) => prev.filter((i) => i.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [images]
  );

  const selectedImages = useMemo(
    () => images.filter((img) => selectedIds.has(img.id)),
    [images, selectedIds]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            Ola Moodboard
          </h1>
          {step === "board" && (
            <button
              onClick={() => setStep("upload")}
              className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              &larr; Back to Photos
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {step === "upload" && (
          <div className="space-y-6">
            {/* Upload area */}
            <ImageUploader onImagesAdded={handleImagesAdded} />

            {/* Gallery */}
            {images.length > 0 && (
              <>
                <ImageGallery
                  images={images}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onRemoveImage={handleRemoveImage}
                />

                {/* Grid config + project title + generate */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
                  {/* Project title */}
                  <div className="space-y-2">
                    <label
                      htmlFor="project-title"
                      className="text-sm font-semibold text-gray-700 uppercase tracking-wide block"
                    >
                      Project Title
                    </label>
                    <input
                      id="project-title"
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g. Fall 2026 Lookbook"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm
                        focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-400
                        placeholder:text-gray-400"
                    />
                  </div>

                  <GridSizePicker
                    selected={gridConfig}
                    onSelect={setGridConfig}
                  />

                  <button
                    onClick={() => setStep("board")}
                    disabled={selectedIds.size === 0}
                    className="w-full py-3 rounded-lg bg-black text-white font-medium text-sm
                      hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Generate Board ({selectedIds.size} photo
                    {selectedIds.size !== 1 ? "s" : ""})
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === "board" && (
          <div className="space-y-4">
            <div className="print:hidden bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              {/* Editable project title in board view */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="board-title"
                  className="text-sm font-semibold text-gray-700 uppercase tracking-wide shrink-0"
                >
                  Title
                </label>
                <input
                  id="board-title"
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Add a project title..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm
                    focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-400
                    placeholder:text-gray-400"
                />
              </div>
              <GridSizePicker
                selected={gridConfig}
                onSelect={setGridConfig}
              />
            </div>
            <BoardPreview
              images={selectedImages}
              gridConfig={gridConfig}
              projectTitle={projectTitle}
            />
          </div>
        )}
      </main>
    </div>
  );
}
