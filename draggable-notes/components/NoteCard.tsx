
import React, { useState, useRef, useEffect } from 'react';
import { Note, COLOR_MAP } from '../types';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate: (note: Note) => void;
  onBringToFront: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onUpdate, onBringToFront }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const cardStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;

    onBringToFront(note.id);
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    cardStartPos.current = { x: note.position.x, y: note.position.y };
    
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      onUpdate({
        ...note,
        position: {
          x: cardStartPos.current.x + deltaX,
          y: cardStartPos.current.y + deltaY
        }
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.userSelect = 'auto';
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, note, onUpdate]);

  return (
    <div 
      onMouseDown={handleMouseDown}
      className={`absolute w-64 p-5 rounded-2xl border-2 transition-shadow duration-300 cursor-grab active:cursor-grabbing transform
                 ${COLOR_MAP[note.color]} 
                 ${isDragging ? 'shadow-2xl scale-105 z-[9999]' : isHovered ? 'shadow-xl' : 'shadow-md'}`}
      style={{ 
        left: 0, 
        top: 0, 
        transform: `translate3d(${note.position.x}px, ${note.position.y}px, 0)`,
        zIndex: note.zIndex,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out, shadow 0.2s ease, scale 0.2s ease'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-3 select-none">
        <h3 className="font-bold text-lg leading-tight truncate pr-8">{note.title || 'Untitled'}</h3>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
          className={`absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 transition-colors ${isHovered || isDragging ? 'opacity-100' : 'opacity-0'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
