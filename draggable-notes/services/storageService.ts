
import { Note } from '../types';

const STORAGE_KEY = 'lumina_notes_v1';

export const storageService = {
  saveNotes: (notes: Note[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },
  
  loadNotes: (): Note[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse notes from storage', e);
      return [];
    }
  }
};
