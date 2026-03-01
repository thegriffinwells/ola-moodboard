"use client";

import { useCallback, useState } from "react";
import type { VendorEntry, VendorPhoto } from "@/types";

let nextVendorId = 0;
let nextPhotoId = 0;

export default function useVendorTracking() {
  const [entries, setEntries] = useState<VendorEntry[]>([]);

  const addEntry = useCallback(
    (vendorName: string, checkInDate: string, files: File[]) => {
      const photos: VendorPhoto[] = files.map((file) => ({
        id: `vp-${nextPhotoId++}`,
        file,
        url: URL.createObjectURL(file),
      }));
      const entry: VendorEntry = {
        id: `vendor-${nextVendorId++}`,
        vendorName,
        checkInDate,
        checkInPhotos: photos,
        checkOutPhotos: [],
      };
      setEntries((prev) => [...prev, entry]);
    },
    []
  );

  const checkOut = useCallback(
    (entryId: string, checkOutDate: string, files: File[]) => {
      const photos: VendorPhoto[] = files.map((file) => ({
        id: `vp-${nextPhotoId++}`,
        file,
        url: URL.createObjectURL(file),
      }));
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, checkOutDate, checkOutPhotos: photos } : e
        )
      );
    },
    []
  );

  const removeEntry = useCallback((entryId: string) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === entryId);
      if (entry) {
        entry.checkInPhotos.forEach((p) => URL.revokeObjectURL(p.url));
        entry.checkOutPhotos.forEach((p) => URL.revokeObjectURL(p.url));
      }
      return prev.filter((e) => e.id !== entryId);
    });
  }, []);

  return { entries, addEntry, checkOut, removeEntry };
}
