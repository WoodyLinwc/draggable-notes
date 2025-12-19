
export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'gray';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  createdAt: number;
  updatedAt: number;
  position: {
    x: number;
    y: number;
  };
  zIndex: number;
}

export const COLOR_MAP: Record<NoteColor, string> = {
  yellow: 'bg-yellow-100 border-yellow-200 text-yellow-900',
  blue: 'bg-blue-100 border-blue-200 text-blue-900',
  green: 'bg-emerald-100 border-emerald-200 text-emerald-900',
  pink: 'bg-rose-100 border-rose-200 text-rose-900',
  purple: 'bg-purple-100 border-purple-200 text-purple-900',
  orange: 'bg-orange-100 border-orange-200 text-orange-900',
  gray: 'bg-slate-100 border-slate-200 text-slate-900',
};

export const COLOR_DOTS: Record<NoteColor, string> = {
  yellow: 'bg-yellow-400',
  blue: 'bg-blue-400',
  green: 'bg-emerald-400',
  pink: 'bg-rose-400',
  purple: 'bg-purple-400',
  orange: 'bg-orange-400',
  gray: 'bg-slate-400',
};
