
import React, { useState } from 'react';
import { Note, NoteColor, COLOR_DOTS, COLOR_MAP } from '../types';

interface NoteEditorProps {
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'position' | 'zIndex'>) => void;
  onClose: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('yellow');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave({ title, content, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[20000] flex items-center justify-center p-4 sm:p-6">
      <div 
        className={`w-full max-w-lg rounded-[2.5rem] shadow-2xl border-2 transition-colors duration-500 overflow-hidden ${COLOR_MAP[color]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">New Note</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-black/10 rounded-full transition-colors active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              autoFocus
              type="text"
              placeholder="Title (optional)"
              className="w-full bg-transparent border-none focus:ring-0 text-xl font-bold placeholder:opacity-30 p-0"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Start typing..."
              rows={5}
              className="w-full bg-transparent border-none focus:ring-0 text-lg resize-none placeholder:opacity-30 leading-relaxed p-0"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex gap-2.5">
                {(Object.keys(COLOR_DOTS) as NoteColor[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full ${COLOR_DOTS[c]} transition-all duration-200 ring-offset-2 ${color === c ? 'ring-2 ring-black/40 scale-110 shadow-md' : 'hover:scale-105 active:scale-90'}`}
                  />
                ))}
              </div>
              
              <button
                type="submit"
                disabled={!content.trim()}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
