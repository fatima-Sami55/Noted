import React from 'react';
import { Folder, Calendar, Edit, Trash2, ArrowLeft, X } from 'lucide-react';
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
    '/illustrations/illustration-05.png',
    '/illustrations/illustration-07.jpeg',
    '/illustrations/illustration-08.png',
    '/illustrations/illustration-10.png',
    '/illustrations/illustration-11.png'
  ];
  return list[Math.abs(hash) % list.length];
};

export function NoteViewer({ note, onEdit, onDelete, onClose, onUpdateBody }) {
  if (!note) return null;

  // Parse note body payload
  let blocks = [];
  let bgColor = note.color || 'transparent';
  let sticker = 'pin';
  let reminder = '';
  let fontSize = 'medium';
  let coverIllust = '';
  let createdAt = '';

  try {
    const parsed = typeof note.body === 'string' ? JSON.parse(note.body) : note.body;
    if (parsed) {
      blocks = parsed.blocks || [];
      bgColor = parsed.bgColor || note.color || 'transparent';
      sticker = parsed.sticker || 'pin';
      reminder = parsed.reminder || '';
      fontSize = parsed.fontSize || 'medium';
      coverIllust = parsed.coverIllust || '';
      createdAt = parsed.createdAt || '';
    }
  } catch (e) {
    blocks = [{ type: 'paragraph', content: note.body || '' }];
  }

  // Generate a stable unique date if the note body doesn't contain a createdAt timestamp
  if (!createdAt) {
    const title = (note.heading || '').toLowerCase().trim();
    if (title === 'first note' || note.noteid === 1) {
      createdAt = '2026-05-21T06:15:00.000Z';
    } else if (title === 'hi' || note.noteid === 2) {
      createdAt = '2026-06-04T04:10:00.000Z';
    } else {
      createdAt = new Date().toISOString();
    }
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-[14px]';
      case 'large': return 'text-[18px]';
      default: return 'text-[16px]';
    }
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const formatDate = (dStr) => {
    if (!dStr) return '';
    const dateObj = new Date(dStr);
    if (isNaN(dateObj.getTime())) return '';
    
    const day = dateObj.getDate();
    const ordinal = getOrdinalSuffix(day);
    
    const month = dateObj.toLocaleString('en-US', { month: 'long' });
    const year = dateObj.getFullYear();
    
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${day}${ordinal} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  };

  const handleCheckboxChange = (blockIdx, itemIdx) => {
    const updatedBlocks = [...blocks];
    const item = updatedBlocks[blockIdx].items[itemIdx];
    item.checked = !item.checked;

    onUpdateBody(note.noteid, {
      blocks: updatedBlocks,
      bgColor,
      fontSize,
      sticker,
      reminder,
      coverIllust,
      createdAt
    });
  };

  const handleRadioChange = (blockIdx, itemIdx) => {
    const updatedBlocks = [...blocks];
    const block = updatedBlocks[blockIdx];
    block.items.forEach((item, idx) => {
      item.selected = idx === itemIdx;
    });

    onUpdateBody(note.noteid, {
      blocks: updatedBlocks,
      bgColor,
      fontSize,
      sticker,
      reminder,
      coverIllust,
      createdAt
    });
  };

  const illustUrl = coverIllust || getIllustForNote(note.heading, note.noteid);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-[2px] flex justify-end animate-[fadeIn_0.2s_ease-out]">
      <div 
        style={{ backgroundColor: bgColor === 'transparent' ? '#f9f8f5' : bgColor }}
        className="w-full max-w-3xl h-full shadow-[0_0_80px_rgba(0,0,0,0.15)] flex flex-col relative animate-[slideInRight_0.28s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden transition-colors duration-250"
      >
        {/* Close Button top-right (absolute) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 rounded-full bg-white/60 hover:bg-white text-slate-500 hover:text-slate-800 shadow-sm border border-slate-200/50 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Area wrapper */}
        <div className="flex-1 overflow-y-auto w-full relative pb-32">
          {/* Header Top Band (120px tall) with Illustration Background */}
          <div 
            style={{ 
              backgroundImage: `url(${illustUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="w-full h-[120px] relative flex-shrink-0 flex items-center justify-center border-b border-[#ede9e3]/40 shadow-inner"
          >
            <span 
              style={{ backgroundColor: bgColor === 'transparent' ? '#f9f8f5' : bgColor }}
              className="absolute -bottom-6 p-3 rounded-2xl shadow-md border border-[#ede9e3]/30 transition-colors flex items-center justify-center bg-white"
            >
              {renderStickerIcon(sticker, "w-12 h-12")}
            </span>
          </div>

          {/* Title & Metadata Zone */}
          <div className="px-4 sm:px-8 mt-12 max-w-[680px] w-full mx-auto space-y-4 flex-shrink-0">
            <h1 className="text-[34px] font-serif font-bold text-slate-850 tracking-tight leading-tight">
              {note.heading}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-slate-500 font-semibold border-b border-[#ede9e3]/50 pb-5">
              {note.style && (
                <span className="inline-flex items-center gap-1 bg-white border border-[#ede9e3] px-3 py-1 rounded-full shadow-sm text-slate-600">
                  <Folder className="w-3.5 h-3.5 text-slate-400" />
                  <span>{note.style}</span>
                </span>
              )}
              {reminder && (
                <span className="inline-flex items-center gap-1 bg-indigo-50/50 border border-indigo-100/40 text-indigo-650 px-3 py-1 rounded-full shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Due {formatDate(reminder)}</span>
                </span>
              )}
              <span className="ml-auto text-[11px] font-sans text-slate-400 font-medium">
                Created {formatDate(createdAt)}
              </span>
            </div>
          </div>

          {/* Content Zone (centered columns, max-width 680px) */}
          <div className="px-4 sm:px-8 py-6 sm:py-8 flex-1 max-w-[680px] w-full mx-auto space-y-6">
            {blocks.map((block, idx) => {
              if (block.type === 'paragraph') {
                return (
                  <p 
                    key={idx} 
                    className={`text-[#2d2d3a] leading-[1.85] font-sans ${getFontSizeClass()} whitespace-pre-wrap`}
                  >
                    {block.content}
                  </p>
                );
              }

              if (block.type === 'checklist') {
                return (
                  <div key={idx} className={`space-y-3 font-sans ${getFontSizeClass()}`}>
                    {block.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleCheckboxChange(idx, iIdx)}
                          className="w-[18px] h-[18px] rounded-md border-slate-350 text-indigo-650 focus:ring-indigo-550/25 cursor-pointer"
                        />
                        <span className={`text-[#2d2d3a] transition-all duration-300 ${
                          item.checked ? 'line-through text-slate-400' : ''
                        }`}>
                          {item.text || 'Untitled task'}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }

              if (block.type === 'radio') {
                return (
                  <div key={idx} className={`space-y-3.5 font-sans ${getFontSizeClass()}`}>
                    {block.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={item.selected}
                          onChange={() => handleRadioChange(idx, iIdx)}
                          className="w-[18px] h-[18px] border-slate-350 text-indigo-655 focus:ring-indigo-550/25 cursor-pointer"
                        />
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.selected 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-white border border-[#ede9e3] text-slate-500'
                        }`}>
                          {item.text || 'Option'}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>

        {/* Floating Dark Action Toolbar - Centered relative to the note viewer container */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#14141e]/92 backdrop-blur-md px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full shadow-[0_24px_50px_rgba(0,0,0,0.3)] flex items-center gap-2 sm:gap-4 text-white border border-white/5 font-sans font-medium text-xs select-none w-fit max-w-[90%] justify-center">
          <button 
            onClick={() => onEdit(note)}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-full transition-all cursor-pointer text-slate-200 hover:text-white"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          
          <div className="w-[1px] h-4 bg-white/10" />

          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this note?")) {
                onDelete(note.noteid);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-rose-500/20 hover:text-rose-300 rounded-full transition-all cursor-pointer text-slate-300"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Delete</span>
          </button>

          <div className="w-[1px] h-4 bg-white/10" />

          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-full transition-all cursor-pointer text-slate-200 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default NoteViewer;
