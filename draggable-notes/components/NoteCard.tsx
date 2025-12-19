import React, { useState, useRef, useEffect } from "react";
import { Note, COLOR_MAP } from "../types";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate: (note: Note) => void;
  onBringToFront: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onDelete,
  onUpdate,
  onBringToFront,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const cardStartPos = useRef({ x: 0, y: 0 });
  const longPressTimer = useRef<number | null>(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  // --- Mouse Events (Desktop) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    startDragging(e.clientX, e.clientY);
  };

  // --- Touch Events (Mobile) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;

    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    // Clear any existing timer
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);

    // Start long press timer (500ms)
    longPressTimer.current = window.setTimeout(() => {
      setIsLongPressing(true);
      startDragging(touch.clientX, touch.clientY);
      // Optional: Add haptic feedback if available
      if ("vibrate" in navigator) navigator.vibrate(50);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];

    // If we are not dragging yet, check if user has moved too much (cancels long press)
    if (!isDragging && !isLongPressing) {
      const dist = Math.hypot(
        touch.clientX - touchStartPos.current.x,
        touch.clientY - touchStartPos.current.y
      );
      if (dist > 10) {
        if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
      }
    }

    // If dragging, prevent page scroll and update position
    if (isDragging) {
      if (e.cancelable) e.preventDefault();
      updatePosition(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    stopDragging();
    setIsLongPressing(false);
  };

  // --- Shared Logic ---
  const startDragging = (clientX: number, clientY: number) => {
    onBringToFront(note.id);
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    cardStartPos.current = { x: note.position.x, y: note.position.y };
    document.body.style.userSelect = "none";
    document.body.style.overflow = "hidden"; // Lock scrolling on mobile
  };

  const updatePosition = (clientX: number, clientY: number) => {
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;

    // Constrain Y position to prevent dragging above filter tabs
    const MIN_Y = 150; // Minimum Y position (adjust based on header height)
    const newY = Math.max(MIN_Y, cardStartPos.current.y + deltaY);

    onUpdate({
      ...note,
      position: {
        x: cardStartPos.current.x + deltaX,
        y: newY,
      },
    });
  };

  const stopDragging = () => {
    setIsDragging(false);
    document.body.style.userSelect = "auto";
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) updatePosition(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      if (isDragging) stopDragging();
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, note, onUpdate]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`absolute w-64 p-5 rounded-2xl border-2 transition-all duration-200 cursor-grab active:cursor-grabbing transform
                 ${COLOR_MAP[note.color]} 
                 ${
                   isDragging
                     ? "shadow-2xl scale-105 z-[9999]"
                     : isHovered
                     ? "shadow-xl"
                     : "shadow-md"
                 }
                 ${isLongPressing ? "scale-110 shadow-2xl opacity-90" : ""}`}
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${note.position.x}px, ${note.position.y}px, 0)`,
        zIndex: note.zIndex,
        transition: isDragging
          ? "none"
          : "transform 0.1s ease-out, shadow 0.2s ease, scale 0.2s ease",
        touchAction: "none", // Crucial for mobile dragging
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-3 select-none">
        <h3 className="font-bold text-lg leading-tight truncate pr-8">
          {note.title || "Untitled"}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className={`absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 transition-colors ${
            isHovered || isDragging
              ? "opacity-100"
              : "opacity-0 md:opacity-0 opacity-100"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed mb-6 min-h-[60px] select-none pointer-events-none">
        {note.content}
      </p>

      <div className="flex items-center justify-between mt-auto border-t border-black/5 pt-4 select-none">
        <span className="text-[10px] opacity-60 font-medium tracking-wide uppercase">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default NoteCard;
