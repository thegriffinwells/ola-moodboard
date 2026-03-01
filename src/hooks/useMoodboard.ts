"use client";

import { useCallback, useMemo, useState } from "react";
import type { ImageItem, GridConfig } from "@/types";

type Step = "upload" | "board";

let nextId = 0;

export default function useMoodboard() {
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

  const handleAssignCategory = useCallback(
    (ids: string[], category: string) => {
      setImages((prev) =>
        prev.map((img) =>
          ids.includes(img.id) ? { ...img, category } : img
        )
      );
    },
    []
  );

  const handleRemoveCategory = useCallback((ids: string[]) => {
    setImages((prev) =>
      prev.map((img) => {
        if (ids.includes(img.id)) {
          const { category: _, ...rest } = img;
          return rest as ImageItem;
        }
        return img;
      })
    );
  }, []);

  const selectedImages = useMemo(
    () => images.filter((img) => selectedIds.has(img.id)),
    [images, selectedIds]
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    images.forEach((img) => {
      if (img.category) cats.add(img.category);
    });
    return Array.from(cats).sort();
  }, [images]);

  return {
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
  };
}
