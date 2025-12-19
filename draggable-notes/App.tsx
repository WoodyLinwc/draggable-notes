import React, { useState, useEffect, useMemo } from "react";
import { Note, NoteColor } from "./types";
import { storageService } from "./services/storageService";
import NoteCard from "./components/NoteCard";
import NoteEditor from "./components/NoteEditor";

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterColor, setFilterColor] = useState<NoteColor | "all">("all");

  // Track max Z index for layering
  const maxZIndex = useMemo(() => {
    if (notes.length === 0) return 1;
    return Math.max(...notes.map((n) => n.zIndex || 1));
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

  const handleAddNote = (
    newNoteData: Omit<
      Note,
      "id" | "createdAt" | "updatedAt" | "position" | "zIndex"
    >
  ) => {
    // Responsive spawn position
    const isMobile = window.innerWidth < 768;
    const centerX = window.innerWidth / 2;
    const spawnWidth = isMobile ? 140 : 128; // Half of card width roughly

    const randomX = Math.max(
      20,
      Math.min(
        window.innerWidth - 280,
        centerX - spawnWidth + (Math.random() * 40 - 20)
      )
    );
    const randomY = isMobile ? 320 : 250;

    const newNote: Note = {
      ...newNoteData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: { x: randomX, y: randomY },
      zIndex: maxZIndex + 1,
    };
    setNotes([...notes, newNote]);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  };

  const handleBringToFront = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, zIndex: maxZIndex + 1 } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotes([]);
    setShowClearConfirm(false);
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const titleMatch = n.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const contentMatch = n.content
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || contentMatch;
      const matchesColor = filterColor === "all" || n.color === filterColor;
      return matchesSearch && matchesColor;
    });
  }, [notes, searchQuery, filterColor]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Navigation UI - Lowered Z-index to avoid overlapping modals */}
      <div className="relative z-[10] px-4 md:px-8 max-w-7xl mx-auto pointer-events-none">
        <header className="pt-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 pointer-events-auto">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Draggable Notes
            </h1>
            <p className="text-slate-500 font-medium text-xs md:text-sm">
              Drag your thoughts anywhere.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-white/90 backdrop-blur border border-slate-200 rounded-xl w-full sm:w-48 focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setIsEditorOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg text-sm"
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
                  strokeWidth="3"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Note
            </button>
          </div>
        </header>

        {/* Filter Tabs with Clear All Button */}
        <div className="flex items-center justify-between gap-4 pb-4 pointer-events-auto">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterColor("all")}
              className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${
                filterColor === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 shadow-sm"
              }`}
            >
              All
            </button>
            {(
              [
                "yellow",
                "blue",
                "green",
                "pink",
                "purple",
                "orange",
                "gray",
              ] as NoteColor[]
            ).map((c) => (
              <button
                key={c}
                onClick={() => setFilterColor(c)}
                className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold transition-all capitalize border border-transparent whitespace-nowrap ${
                  filterColor === c
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-500 shadow-sm"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {notes.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap shadow-sm border border-red-200"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <main className="absolute inset-0 z-0">
        {filteredNotes.length === 0 && searchQuery === "" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 px-8 text-center">
            <svg
              className="w-20 h-20 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <p className="text-lg font-bold">Workspace is empty</p>
            <p className="text-sm">Create a note to get started</p>
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

      {/* Clear All Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[20000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Clear All Notes?
                </h3>
                <p className="text-sm text-slate-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-slate-600 mb-6">
              Are you sure you want to delete all{" "}
              <span className="font-bold">{notes.length}</span> note
              {notes.length !== 1 ? "s" : ""}? This will permanently remove all
              your notes from storage.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
