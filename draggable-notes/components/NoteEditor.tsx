
import React, { useState } from 'react';
import { Note, NoteColor, COLOR_DOTS, COLOR_MAP } from '../types';

interface NoteEditorProps {
  // Fix: NoteEditor only provides title, content, and color. 
  // Position, zIndex, id, and timestamps are handled by the parent handleAddNote function.
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-lg rounded-3xl shadow-2xl border-2 transition-colors duration-500 overflow-hidden ${COLOR_MAP[color]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">New Thought</h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              autoFocus
              type="text"
              placeholder="Give it a title..."
              className="w-full bg-transparent border-none focus:ring-0 text-xl font-semibold placeholder:opacity-40"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="What's on your mind?"
              rows={6}
              className="w-full bg-transparent border-none focus:ring-0 text-lg resize-none placeholder:opacity-40 leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                {(Object.keys(COLOR_DOTS) as NoteColor[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full ${COLOR_DOTS[c]} transition-all duration-200 ring-offset-2 ${color === c ? 'ring-2 ring-black/40 scale-110' : 'hover:scale-105'}`}
                  />
                ))}
              </div>
              
              <button
                type="submit"
                disabled={!content.trim()}
                className="px-8 py-3 bg-black text-white rounded-full font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-20"
              >
                Create Note
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
