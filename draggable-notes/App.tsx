
import React, { useState, useEffect, useMemo } from 'react';
import { Note, NoteColor } from './types';
import { storageService } from './services/storageService';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterColor, setFilterColor] = useState<NoteColor | 'all'>('all');

  // Track max Z index for layering
  const maxZIndex = useMemo(() => {
    if (notes.length === 0) return 1;
    return Math.max(...notes.map(n => n.zIndex || 1));
  }, [notes]);

  // Load notes on mount
  useEffect(() => {
    const savedNotes = storageService.loadNotes();
    setNotes(savedNotes);
  }, []);

  // Sync to local storage on change
  useEffect(() => {
    storageService.saveNotes(notes);
  }, [notes]);

  const handleAddNote = (newNoteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'position' | 'zIndex'>) => {
    // Random position near the top center for new notes
    const randomX = (window.innerWidth / 2) - 128 + (Math.random() * 100 - 50);
    const randomY = 250 + (Math.random() * 100 - 50);

    const newNote: Note = {
      ...newNoteData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: { x: randomX, y: randomY },
      zIndex: maxZIndex + 1
    };
    setNotes([...notes, newNote]);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
  };

  const handleBringToFront = (id: string) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, zIndex: maxZIndex + 1 } : n
    ));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesColor = filterColor === 'all' || n.color === filterColor;
      return matchesSearch && matchesColor;
    });
  }, [notes, searchQuery, filterColor]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Navigation UI - Kept fixed at top */}
      <div className="relative z-[10000] px-4 md:px-8 max-w-7xl mx-auto pointer-events-none">
        <header className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 pointer-events-auto">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Draggable Notes</h1>
            <p className="text-slate-500 font-medium text-sm">Drag your thoughts anywhere.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-white/80 backdrop-blur border border-slate-200 rounded-xl w-full sm:w-48 focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => setIsEditorOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </button>
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar pointer-events-auto">
          <button 
            onClick={() => setFilterColor('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filterColor === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 shadow-sm'}`}
          >
            All
          </button>
          {(['yellow', 'blue', 'green', 'pink', 'purple', 'orange', 'gray'] as NoteColor[]).map((c) => (
            <button 
              key={c}
              onClick={() => setFilterColor(c)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all capitalize border border-transparent whitespace-nowrap ${filterColor === c ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 shadow-sm'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <main className="absolute inset-0 z-0">
        {filteredNotes.length === 0 && searchQuery === '' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
            <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <p className="text-xl font-bold">Workspace is empty</p>
          </div>
        )}

        {filteredNotes.map((note) => (
          <NoteCard 
            key={note.id} 
            note={note} 
            onDelete={handleDeleteNote} 
            onUpdate={handleUpdateNote}
            onBringToFront={handleBringToFront}
          />
        ))}
      </main>

      {/* Editor Modal */}
      {isEditorOpen && (
        <NoteEditor 
          onSave={handleAddNote} 
          onClose={() => setIsEditorOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
