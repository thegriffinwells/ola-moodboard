export interface ImageItem {
  id: string;
  file: File;
  url: string;
  category?: string;
}

export interface GridConfig {
  cols: number;
  rows: number;
  label: string;
}

export interface VendorPhoto {
  id: string;
  file: File;
  url: string;
}

export interface VendorEntry {
  id: string;
  vendorName: string;
  checkInDate: string;
  checkInPhotos: VendorPhoto[];
  checkOutDate?: string;
  checkOutPhotos: VendorPhoto[];
}

export type AppTab = "moodboard" | "vendor-tracking";
