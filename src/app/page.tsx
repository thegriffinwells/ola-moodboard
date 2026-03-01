"use client";

import { useState } from "react";
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("moodboard");

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
