import React from 'react';
import { Edit2, Trash2, Calendar, Folder } from 'lucide-react';
import { renderStickerIcon } from './NoteEditor';

const getIllustForNote = (heading, noteid) => {
  const key = (heading || '') + (noteid || 0);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const list = [
    '/illustrations/illustration-01.png',
    '/illustrations/illustration-02.png',
    '/illustrations/illustration-03.jpeg',
    '/illustrations/illustration-04.jpeg',
    '/illustrations/illustration-05.jpeg',
    '/illustrations/illustration-07.jpeg',
    '/illustrations/illustration-08.png',
    '/illustrations/illustration-10.png'
  ];
  return list[Math.abs(hash) % list.length];
};

export function NoteCard({ note, onEdit, onDelete, onClick, viewType }) {
  let blocks = [];
  let bgColor = note.color || '#e0f2fe';
  let sticker = 'pin';
  let reminder = '';
  let coverIllust = '';

  try {
    const parsed = typeof note.body === 'string' ? JSON.parse(note.body) : note.body;
    if (parsed) {
      blocks = parsed.blocks || [];
      bgColor = parsed.bgColor || note.color || '#e0f2fe';
      sticker = parsed.sticker || 'pin';
      reminder = parsed.reminder || '';
      coverIllust = parsed.coverIllust || '';
    }
  } catch (e) {
    blocks = [{ type: 'paragraph', content: note.body }];
  }

  const formatDate = (d) => {
    if (!d) return '';
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const illustUrl = coverIllust || getIllustForNote(note.heading, note.noteid);

  // 1. Render Horizontal List Layout Card (List View)
  if (viewType === 'list') {
    return (
      <div 
        onClick={() => onClick(note)}
        style={{ backgroundColor: bgColor === 'transparent' ? '#ffffff' : bgColor }}
        className="group rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-black/[0.02] flex items-center gap-4 cursor-pointer relative select-none"
      >
        {/* Left: Cover snippet instead of simple sticker */}
        <div className="w-[60px] h-[60px] relative overflow-hidden bg-slate-50 flex-shrink-0 rounded-xl border border-black/[0.04] shadow-xs">
          <img src={illustUrl} alt="Cover" className="w-full h-full object-cover" />
        </div>
        
        {/* Right: Content details */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-hidden">
              {renderStickerIcon(sticker, "w-5 h-5")}
              <h3 className="font-bold text-slate-800 text-sm truncate leading-tight">
                {note.heading}
              </h3>
            </div>
            
            {/* Edit / Delete actions */}
            <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/50 backdrop-blur-sm p-1 rounded-lg border border-white/40 absolute top-3 right-3 z-10">
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onEdit(note); 
                }}
                className="p-1 rounded-md text-slate-600 hover:text-indigo-655 hover:bg-white/60 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Are you sure you want to delete this note?")) {
                    onDelete(note.noteid);
                  }
                }}
                className="p-1 rounded-md text-slate-655 hover:text-rose-500 hover:bg-white/60 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal font-medium pr-10">
            {blocks.map(b => b.type === 'paragraph' ? b.content : b.items ? b.items.map(item => item.text).join(', ') : '').join(' ')}
          </p>

          <div className="flex items-center gap-2 mt-0.5">
            {note.style && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-white/40 border border-white/60 px-2 py-0.5 rounded-md">
                <span>{note.style}</span>
              </span>
            )}
            {reminder && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-700 bg-indigo-50/50 border border-indigo-100/40 px-2 py-0.5 rounded-md">
                <span>Due {formatDate(reminder)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(note)}
      className="group notebook-card w-full h-[300px] bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#ede9e3]/60 cursor-pointer overflow-hidden flex flex-col relative select-none"
    >
      {/* Cover Illustration Area (Top 65%) */}
      <div className="h-[65%] w-full relative overflow-hidden bg-slate-50 flex-shrink-0">
        <img src={illustUrl} alt="Cover" className="w-full h-full object-cover" />

        {/* Action Overlay (top-right of cover) */}
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0 bg-white/45 backdrop-blur-sm p-1 rounded-xl border border-white/60 absolute top-3 right-3 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            title="Edit Note"
            className="p-1.5 rounded-lg text-slate-700 hover:text-indigo-650 hover:bg-white/60 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Are you sure you want to delete this note?")) {
                onDelete(note.noteid);
              }
            }}
            title="Delete Note"
            className="p-1.5 rounded-lg text-slate-700 hover:text-rose-500 hover:bg-white/60 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title & Metadata Area (Bottom 35%) */}
      <div className="h-[35%] bg-white p-4 flex flex-col justify-between border-t border-[#ede9e3]/50">
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {renderStickerIcon(sticker, "w-6 h-6")}
            <h3 className="font-serif font-bold text-slate-800 text-sm truncate leading-tight">
              {note.heading}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] font-sans text-slate-400 font-medium">
            Last edited {formatDate(note.created_at || note.date) || 'recently'}
          </span>
          {note.style && (
            <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">
              {note.style}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoteCard;
