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

// --- Backend types ---

export type Role = "assistant" | "stylist";

export interface BoardRecord {
  id: string;
  title: string;
  grid_cols: number;
  grid_rows: number;
  grid_label: string;
  status: "pending" | "reviewed";
  created_at: string;
}

export interface BoardImageRecord {
  id: number;
  board_id: string;
  filename: string;
  original_name: string;
  category: string | null;
  sort_order: number;
}

export interface AnnotationRecord {
  id: number;
  board_id: string;
  image_id: number;
  selected: number;
  note: string;
  created_at: string;
}

export interface BoardWithImages extends BoardRecord {
  images: BoardImageRecord[];
}

export interface BoardWithAnnotations extends BoardWithImages {
  annotations: AnnotationRecord[];
}
