"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppTab } from "@/types";
import ImageUploader from "@/components/ImageUploader";
import ImageGallery from "@/components/ImageGallery";
import GridSizePicker from "@/components/GridSizePicker";
import BoardPreview from "@/components/BoardPreview";
import CategoryAssigner from "@/components/CategoryAssigner";
import TabBar from "@/components/TabBar";
import VendorTrackingTab from "@/components/VendorTrackingTab";
import useMoodboard from "@/hooks/useMoodboard";
import useVendorTracking from "@/hooks/useVendorTracking";

export default function CreatePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AppTab>("moodboard");
  const [publishing, setPublishing] = useState(false);

  const {
    images,
    selectedIds,
    gridConfig,
    setGridConfig,
    step,
    setStep,
    projectTitle,
    setProjectTitle,
    selectedImages,
    categories,
    handleImagesAdded,
    handleToggleSelect,
    handleSelectAll,
    handleDeselectAll,
    handleRemoveImage,
    handleAssignCategory,
    handleRemoveCategory,
  } = useMoodboard();

  const vendorTracking = useVendorTracking();

  const handlePublish = async () => {
    if (selectedImages.length === 0) return;
    setPublishing(true);

    try {
      // 1. Upload all selected images
      const formData = new FormData();
      for (const img of selectedImages) {
        formData.append("files", img.file);
      }

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error);

      // 2. Create the board with uploaded blob URLs
      const boardImages = uploadData.files.map(
        (f: { url: string; originalName: string }, i: number) => {
          const sourceImg = selectedImages[i];
          return {
            url: f.url,
            originalName: f.originalName,
            category: sourceImg?.category || undefined,
          };
        }
      );

      const boardRes = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle,
          gridCols: gridConfig.cols,
          gridRows: gridConfig.rows,
          gridLabel: gridConfig.label,
          images: boardImages,
        }),
      });
      const boardData = await boardRes.json();

      if (!boardRes.ok) throw new Error(boardData.error);

      // 3. Redirect to board view
      router.push(`/board/${boardData.id}`);
    } catch (err) {
      console.error("Publish failed:", err);
      alert("Failed to publish board. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Back to home"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold tracking-tight">
                Ola Moodboard
              </h1>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Project title..."
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm
                  focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-400
                  placeholder:text-gray-400 w-48"
              />
            </div>
            {activeTab === "moodboard" && step === "board" && (
              <button
                onClick={() => setStep("upload")}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                &larr; Back to Photos
              </button>
            )}
          </div>
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Moodboard Tab */}
        {activeTab === "moodboard" && (
          <>
            {step === "upload" && (
              <div className="space-y-6">
                <ImageUploader onImagesAdded={handleImagesAdded} />

                {images.length > 0 && (
                  <>
                    <ImageGallery
                      images={images}
                      selectedIds={selectedIds}
                      categories={categories}
                      onToggleSelect={handleToggleSelect}
                      onSelectAll={handleSelectAll}
                      onDeselectAll={handleDeselectAll}
                      onRemoveImage={handleRemoveImage}
                    />

                    <CategoryAssigner
                      selectedIds={selectedIds}
                      existingCategories={categories}
                      onAssignCategory={handleAssignCategory}
                      onRemoveCategory={handleRemoveCategory}
                    />

                    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
                      <GridSizePicker
                        selected={gridConfig}
                        onSelect={setGridConfig}
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep("board")}
                          disabled={selectedIds.size === 0}
                          className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm
                            hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          Preview Board ({selectedIds.size} photo
                          {selectedIds.size !== 1 ? "s" : ""})
                        </button>
                        <button
                          onClick={handlePublish}
                          disabled={selectedIds.size === 0 || publishing}
                          className="flex-1 py-3 rounded-lg bg-black text-white font-medium text-sm
                            hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {publishing ? "Publishing..." : `Publish Board (${selectedIds.size} photo${selectedIds.size !== 1 ? "s" : ""})`}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === "board" && (
              <div className="space-y-4">
                <div className="print:hidden bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                  <GridSizePicker
                    selected={gridConfig}
                    onSelect={setGridConfig}
                  />
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="w-full py-3 rounded-lg bg-black text-white font-medium text-sm
                      hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-wait transition-colors"
                  >
                    {publishing ? "Publishing..." : "Publish Board"}
                  </button>
                </div>
                <BoardPreview
                  images={selectedImages}
                  gridConfig={gridConfig}
                  projectTitle={projectTitle}
                />
              </div>
            )}
          </>
        )}

        {/* Vendor Tracking Tab */}
        {activeTab === "vendor-tracking" && (
          <VendorTrackingTab
            entries={vendorTracking.entries}
            projectTitle={projectTitle}
            onAddEntry={vendorTracking.addEntry}
            onCheckOut={vendorTracking.checkOut}
            onRemoveEntry={vendorTracking.removeEntry}
          />
        )}
      </main>
    </div>
  );
}
