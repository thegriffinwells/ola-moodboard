interface AnnotationOverlayProps {
  selected: boolean;
  note?: string;
}

export default function AnnotationOverlay({
  selected,
  note,
}: AnnotationOverlayProps) {
  if (!selected) return null;

  return (
    <>
      {/* Green checkmark badge */}
      <div className="absolute top-2 right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-sm z-10">
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Green ring */}
      <div className="absolute inset-0 ring-3 ring-green-500 ring-inset rounded pointer-events-none z-10" />

      {/* Note label */}
      {note && (
        <div className="absolute bottom-1 left-1 right-1 flex justify-center z-10">
          <span className="text-[10px] px-2 py-0.5 rounded bg-green-600/90 text-white truncate max-w-full">
            {note}
          </span>
        </div>
      )}
    </>
  );
}
