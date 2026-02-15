"use client";

export interface GridConfig {
  cols: number;
  rows: number;
  label: string;
}

const GRID_OPTIONS: GridConfig[] = [
  { cols: 1, rows: 1, label: "1 per page" },
  { cols: 1, rows: 2, label: "2 per page" },
  { cols: 2, rows: 2, label: "4 per page" },
  { cols: 2, rows: 3, label: "6 per page" },
  { cols: 3, rows: 3, label: "9 per page" },
  { cols: 4, rows: 3, label: "12 per page" },
];

interface GridSizePickerProps {
  selected: GridConfig;
  onSelect: (config: GridConfig) => void;
}

export default function GridSizePicker({
  selected,
  onSelect,
}: GridSizePickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Grid Size
      </h3>
      <div className="flex flex-wrap gap-2">
        {GRID_OPTIONS.map((opt) => {
          const isActive =
            selected.cols === opt.cols && selected.rows === opt.rows;
          return (
            <button
              key={opt.label}
              onClick={() => onSelect(opt)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-black text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              <div className="flex items-center gap-2">
                {/* Mini grid preview */}
                <div
                  className="grid gap-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${opt.cols}, 6px)`,
                    gridTemplateRows: `repeat(${opt.rows}, 6px)`,
                  }}
                >
                  {Array.from({ length: opt.cols * opt.rows }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-[1px] ${
                        isActive ? "bg-white/60" : "bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
                <span>{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
