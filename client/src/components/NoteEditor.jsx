import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Calendar, FileText, CheckSquare, List,
  ChevronUp, ChevronDown, Smile, Type, Palette, X, Check, ArrowUp, Folder,
  Pin, Lightbulb, Zap, Plane, Coffee, Cat, Key, Rocket, Flame, PartyPopper,
  Star, ShoppingCart, Heart, Bell, BookOpen, Briefcase, Camera, Music, Globe, Lock, CheckCircle
} from 'lucide-react';

const PASTEL_PALETTE = [
  { name: 'Paper', hex: 'transparent' }, // "no color" swatch
  { name: 'Sky Blue', hex: '#e0f2fe' },
  { name: 'Rose Pink', hex: '#ffe4e6' },
  { name: 'Amber Yellow', hex: '#fef3c7' },
  { name: 'Emerald', hex: '#d1fae5' },
  { name: 'Violet', hex: '#ede9fe' },
  { name: 'Royal Blue', hex: '#dbeafe' },
  { name: 'Orange', hex: '#ffedd5' },
  { name: 'Light Pink', hex: '#fce7f3' },
  { name: 'Deep Purple', hex: '#f3e8ff' },
  { name: 'Light Gray', hex: '#f3f4f6' }
];

export const STICKERS = [
  // Priority & Status
  { id: 'pin',        icon: Pin,          label: 'Pinned',    color: '#e63946' },
  { id: 'urgent',     icon: Zap,          label: 'Urgent',    color: '#f4a261' },
  { id: 'done',       icon: CheckCircle,  label: 'Done',      color: '#2a9d8f' },
  { id: 'fire',       icon: Flame,        label: 'Hot',       color: '#e76f51' },

  // Work & Study  
  { id: 'work',       icon: Briefcase,    label: 'Work',      color: '#4361ee' },
  { id: 'notes',      icon: FileText,     label: 'Notes',     color: '#3a86ff' },
  { id: 'idea',       icon: Lightbulb,    label: 'Idea',      color: '#f9c74f' },
  { id: 'read',       icon: BookOpen,     label: 'Reading',   color: '#7209b7' },

  // Life & Personal
  { id: 'calendar',   icon: Calendar,     label: 'Event',     color: '#4cc9f0' },
  { id: 'travel',     icon: Plane,        label: 'Travel',    color: '#06d6a0' },
  { id: 'coffee',     icon: Coffee,       label: 'Coffee',    color: '#8d6a4b' },
  { id: 'shopping',   icon: ShoppingCart, label: 'Shopping',  color: '#f77f00' },

  // Creative & Fun
  { id: 'creative',   icon: Palette,      label: 'Creative',  color: '#9b5de5' },
  { id: 'music',      icon: Music,        label: 'Music',     color: '#f15bb5' },
  { id: 'photo',      icon: Camera,       label: 'Photo',     color: '#00bbf9' },
  { id: 'celebrate',  icon: PartyPopper,  label: 'Celebrate', color: '#fee440' },

  // Misc
  { id: 'favourite',  icon: Heart,        label: 'Favourite', color: '#ef233c' },
  { id: 'reminder',   icon: Bell,         label: 'Reminder',  color: '#4895ef' },
  { id: 'private',    icon: Lock,         label: 'Private',   color: '#6c757d' },
  { id: 'global',     icon: Globe,        label: 'Global',    color: '#2ec4b6' },
];

export function renderStickerIcon(stickerId, sizeClass = "w-5 h-5") {
  const found = STICKERS.find(s => s.id === stickerId);
  if (found) {
    const IconComponent = found.icon;
    return <IconComponent className={sizeClass} style={{ color: found.color }} />;
  }
  // Fallback for old emoji string values
  if (stickerId && stickerId.length <= 2) {
    let emojiTextSize = 'text-lg';
    if (sizeClass.includes('w-6')) emojiTextSize = 'text-xl';
    if (sizeClass.includes('w-12')) emojiTextSize = 'text-5xl';
    return <span className={`${emojiTextSize} flex-shrink-0 leading-none`}>{stickerId}</span>;
  }
  // Default fallback to first sticker (Pin)
  const fallback = STICKERS[0];
  const FallbackIcon = fallback.icon;
  return <FallbackIcon className={sizeClass} style={{ color: fallback.color }} />;
}

const ILLUSTRATIONS = [
  { id: 'ill-01', path: '/illustrations/illustration-01.png' },
  { id: 'ill-02', path: '/illustrations/illustration-02.png' },
  { id: 'ill-03', path: '/illustrations/illustration-03.jpeg' },
  { id: 'ill-04', path: '/illustrations/illustration-04.jpeg' },
  { id: 'ill-05', path: '/illustrations/illustration-05.png' },
  { id: 'ill-06', path: '/illustrations/illustration-06.jpeg' },
  { id: 'ill-07', path: '/illustrations/illustration-07.jpeg' },
  { id: 'ill-08', path: '/illustrations/illustration-08.png' },
  { id: 'ill-09', path: '/illustrations/illustration-09.png' },
  { id: 'ill-10', path: '/illustrations/illustration-10.png' },
  { id: 'ill-11', path: '/illustrations/illustration-11.png' }
];

export function NoteEditor({ note, onSave, onClose, defaultCategory = 'Personal', folders = [] }) {
  const [heading, setHeading] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [bgColor, setBgColor] = useState('transparent');
  const [fontSize, setFontSize] = useState('medium');
  const [sticker, setSticker] = useState('pin');
  const [reminder, setReminder] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [saving, setSaving] = useState(false);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [coverIllust, setCoverIllust] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const titleInputRef = useRef(null);

  // Load existing note data or defaults
  useEffect(() => {
    if (note) {
      setHeading(note.heading || '');
      setCategory(note.style || 'Personal');
      setBgColor(note.color || 'transparent');

      try {
        const parsed = typeof note.body === 'string' ? JSON.parse(note.body) : note.body;
        if (parsed) {
          setBlocks(parsed.blocks || []);
          setBgColor(parsed.bgColor || note.color || 'transparent');
          setFontSize(parsed.fontSize || 'medium');
          setSticker(parsed.sticker || 'pin');
          setReminder(parsed.reminder || '');
          setCoverIllust(parsed.coverIllust || '');
        }
      } catch (e) {
        setBlocks([{ type: 'paragraph', content: note.body || '' }]);
      }
    } else {
      setHeading('');
      setBlocks([{ type: 'paragraph', content: '' }]);
      setBgColor('transparent');
      setFontSize('medium');
      setSticker('pin');
      setReminder('');
      setCategory(defaultCategory);
      setCoverIllust('');
    }

    // Auto-focus title input on open
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 50);
  }, [note]);

  // Block Controls
  const addBlock = (type) => {
    const newBlock = { type };
    if (type === 'paragraph') {
      newBlock.content = '';
    } else if (type === 'checklist') {
      newBlock.items = [{ text: '', checked: false }];
    } else if (type === 'radio') {
      newBlock.items = [{ text: '', selected: false }];
    }
    const newBlocks = [...blocks];
    const insertIdx = (activeBlockIndex !== null && activeBlockIndex >= 0 && activeBlockIndex < blocks.length)
      ? activeBlockIndex + 1
      : blocks.length;
    newBlocks.splice(insertIdx, 0, newBlock);
    setBlocks(newBlocks);
    setActiveBlockIndex(insertIdx);
  };

  const removeBlock = (index) => {
    const copy = [...blocks];
    copy.splice(index, 1);
    setBlocks(copy);
    // Adjust active index
    const nextActive = Math.max(0, index - 1);
    setActiveBlockIndex(nextActive);
  };

  const updateBlockContent = (index, value) => {
    const copy = [...blocks];
    copy[index].content = value;
    setBlocks(copy);
  };

  // Convert current block type
  const setBlockType = (index, newType) => {
    const copy = [...blocks];
    if (!copy[index]) return;
    const currentBlock = copy[index];
    if (currentBlock.type === newType) return;

    let contentStr = '';
    if (currentBlock.type === 'paragraph') {
      contentStr = currentBlock.content || '';
    } else if (currentBlock.items && currentBlock.items[0]) {
      contentStr = currentBlock.items[0].text || '';
    }

    copy[index] = {
      type: newType,
      ...(newType === 'paragraph' ? { content: contentStr } : {}),
      ...(newType === 'checklist' ? { items: [{ text: contentStr, checked: false }] } : {}),
      ...(newType === 'radio' ? { items: [{ text: contentStr, selected: false }] } : {})
    };
    setBlocks(copy);
  };

  // Checklist / Radio manipulation inside blocks
  const addSubitem = (blockIndex) => {
    const copy = [...blocks];
    if (copy[blockIndex].type === 'checklist') {
      copy[blockIndex].items.push({ text: '', checked: false });
    } else if (copy[blockIndex].type === 'radio') {
      copy[blockIndex].items.push({ text: '', selected: false });
    }
    setBlocks(copy);
  };

  const removeSubitem = (blockIndex, itemIndex) => {
    const copy = [...blocks];
    copy[blockIndex].items.splice(itemIndex, 1);
    if (copy[blockIndex].items.length === 0) {
      copy[blockIndex].items.push({ text: '', checked: false });
    }
    setBlocks(copy);
  };

  const updateSubitemText = (blockIndex, itemIndex, value) => {
    const copy = [...blocks];
    copy[blockIndex].items[itemIndex].text = value;
    setBlocks(copy);
  };

  const toggleSubitemState = (blockIndex, itemIndex) => {
    const copy = [...blocks];
    const block = copy[blockIndex];
    if (block.type === 'checklist') {
      block.items[itemIndex].checked = !block.items[itemIndex].checked;
    } else if (block.type === 'radio') {
      block.items.forEach((item, idx) => {
        item.selected = idx === itemIndex;
      });
    }
    setBlocks(copy);
  };

  const moveBlock = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const copy = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setBlocks(copy);
    setActiveBlockIndex(targetIndex);
  };

  // Submit and loading animation
  const handleSave = () => {
    setSaving(true);
    const filteredBlocks = blocks.filter(b => {
      if (b.type === 'paragraph') return b.content.trim() !== '';
      if (b.type === 'checklist' || b.type === 'radio') {
        return b.items.some(item => item.text.trim() !== '');
      }
      return true;
    });

    // Check if the existing note has a createdAt field stored in its body
    let existingCreatedAt = '';
    if (note) {
      try {
        const parsed = typeof note.body === 'string' ? JSON.parse(note.body) : note.body;
        existingCreatedAt = parsed.createdAt;
      } catch (e) {}
    }

    const bodyObj = {
      blocks: filteredBlocks.length > 0 ? filteredBlocks : [{ type: 'paragraph', content: '' }],
      bgColor,
      fontSize,
      sticker,
      reminder,
      coverIllust,
      createdAt: existingCreatedAt || new Date().toISOString()
    };

    const payload = {
      heading: heading.trim() || 'Untitled',
      body: JSON.stringify(bodyObj),
      color: bgColor,
      style: category
    };

    onSave(payload);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  // Formatting date for minimalist date chip
  const formatReminderDate = (dStr) => {
    if (!dStr) return '';
    const dateObj = new Date(dStr);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleReminderClick = () => {
    const picker = document.getElementById('hidden-reminder-date');
    if (picker) {
      if (typeof picker.showPicker === 'function') {
        picker.showPicker();
      } else {
        picker.click();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white overflow-hidden relative animate-[fadeIn_0.2s_ease-out]">
      {/* Top Accent Line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 to-purple-600 flex-shrink-0" />

        {/* Minimal Modal Header */}
        <div className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-slate-100/55 flex-shrink-0 bg-white">
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-slate-400 select-none">
            <span>My Notes</span>
            <span className="text-slate-350">/</span>
            <div className="relative inline-flex items-center group cursor-pointer">
              <Folder className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none pr-4 bg-transparent text-slate-650 hover:text-slate-800 font-bold focus:outline-none cursor-pointer text-[11px] transition-colors"
              >
                {(folders.length > 0 ? folders : [
                  { name: 'Personal' },
                  { name: 'Ideas' },
                  { name: 'Tasks' }
                ]).map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name.toLowerCase() === 'personal' ? 'Journal' : f.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-0 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="lg:hidden p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer mr-2 flex items-center gap-1.5 text-xs font-semibold"
              title="Style Settings"
            >
              <Palette className="w-4 h-4" />
              <span>Style</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Full Split-Panel Grid Layout */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-white relative">
          
          {/* Backdrop overlay for mobile settings drawer */}
          {showSettings && (
            <div 
              onClick={() => setShowSettings(false)}
              className="lg:hidden absolute inset-0 bg-slate-900/20 backdrop-blur-xs z-20 transition-all duration-300"
            />
          )}

          {/* LEFT PANEL (Style Settings) */}
          <div className={`absolute lg:relative inset-y-0 left-0 z-30 lg:z-0 w-[290px] sm:w-[320px] lg:w-[28%] xl:w-[25%] border-r border-slate-200/30 p-6 sm:p-8 flex flex-col gap-6 sm:gap-8 overflow-y-auto bg-white flex-shrink-0 select-none transition-transform duration-300 ease-in-out lg:translate-x-0 lg:transition-none lg:shadow-none ${
            showSettings ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}>
            
            {/* Background Color Picker */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">Color</h4>
              <div className="flex flex-wrap gap-2.5 pt-0.5 select-none">
                {PASTEL_PALETTE.map((colorObj) => {
                  const isTransparent = colorObj.hex === 'transparent';
                  const isSelected = bgColor === colorObj.hex;
                  
                  return (
                    <button
                      key={colorObj.hex}
                      onClick={() => setBgColor(colorObj.hex)}
                      style={{ backgroundColor: isTransparent ? 'transparent' : colorObj.hex }}
                      title={colorObj.name}
                      className={`w-7 h-7 rounded-full cursor-pointer flex-shrink-0 transition-transform duration-150 hover:scale-115 relative ${
                        isTransparent 
                          ? 'border border-dashed border-slate-400/85 bg-white/10' 
                          : 'border border-black/[0.04]'
                      } ${
                        isSelected 
                          ? 'ring-2 ring-slate-400 ring-offset-2 scale-110' 
                          : ''
                      }`}
                    >
                      {isTransparent && <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-400">×</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sticker Picker */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">Sticker</h4>
              <div className="relative pt-1">
                <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
                  {STICKERS.map((stk) => {
                    const isSelected = sticker === stk.id;
                    const IconComponent = stk.icon;
                    return (
                      <button
                        key={stk.id}
                        onClick={() => setSticker(stk.id)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer hover:bg-[#f3f4f6] hover:scale-120 hover:-rotate-5 transition-all duration-150 flex-shrink-0 ${
                          isSelected ? 'bg-[#f3f4f6] scale-110' : ''
                        }`}
                        title={stk.label}
                      >
                        <IconComponent className="w-5 h-5 transition-transform" style={{ color: stk.color }} />
                      </button>
                    );
                  })}
                </div>
                {/* Scroll shadows */}
                <div className="absolute left-0 top-0 bottom-2 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-2 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Cover Illustration Selector */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">Cover</h4>
              <div className="grid grid-cols-4 gap-2 pt-1 max-h-[160px] overflow-y-auto pr-1">
                <button
                  onClick={() => setCoverIllust('')}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                    coverIllust === ''
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 scale-105'
                      : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-indigo-400'
                  }`}
                >
                  <span>Auto</span>
                </button>
                {ILLUSTRATIONS.map((ill) => {
                  const isSelected = coverIllust === ill.path;
                  return (
                    <button
                      key={ill.id}
                      onClick={() => setCoverIllust(ill.path)}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border hover:scale-105 transition-all ${
                        isSelected 
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 scale-105' 
                          : 'border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      <img 
                        src={ill.path} 
                        alt={ill.id} 
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                          <div className="bg-indigo-600 text-white rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size Selector */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">Size</h4>
              <div className="flex bg-slate-100 p-0.5 rounded-full select-none max-w-[140px] border border-slate-200/30">
                {[
                  { label: 'S', value: 'small' },
                  { label: 'M', value: 'medium' },
                  { label: 'L', value: 'large' }
                ].map((sz) => (
                  <button
                    key={sz.value}
                    onClick={() => setFontSize(sz.value)}
                    className={`flex-1 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 ${
                      fontSize === sz.value
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reminder Date Selector */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">Reminder</h4>
              <div className="pt-1">
                {reminder ? (
                  <div className="flex items-center gap-1.5 bg-indigo-50/80 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit">
                    <button
                      onClick={handleReminderClick}
                      className="flex items-center gap-1.5 cursor-pointer text-indigo-650 hover:text-indigo-800"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatReminderDate(reminder)}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReminder('');
                      }}
                      className="p-0.5 rounded-full hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleReminderClick}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer border border-transparent"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Set reminder</span>
                  </button>
                )}

                <input
                  type="date"
                  id="hidden-reminder-date"
                  min={new Date().toISOString().substring(0, 10)}
                  value={reminder ? reminder.substring(0, 10) : ''}
                  onChange={(e) => setReminder(e.target.value)}
                  className="hidden"
                />
              </div>
            </div>

          </div>

          {/* RIGHT PANEL - Writing Area & Content Blocks */}
          <div 
            style={{ backgroundColor: bgColor === 'transparent' ? '#f8f7f4' : bgColor }}
            className="flex-1 flex flex-col p-5 sm:p-8 lg:p-12 overflow-y-auto min-w-0 transition-colors duration-250"
          >
            <div className="max-w-3xl w-full mx-auto space-y-8 flex-1 flex flex-col">
              
              {/* Title Input */}
              <input
                ref={titleInputRef}
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="w-full bg-transparent text-[32px] font-bold font-serif text-[#1a1a2e] focus:outline-none placeholder:text-slate-300 placeholder:italic tracking-tight"
                placeholder="Untitled"
              />

              {/* Add Block Action Toolbar */}
              <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-full w-fit gap-1 mt-1 select-none border border-slate-200/50">
                {[
                  { name: "+ Text", value: "paragraph", icon: FileText },
                  { name: "+ Checklist", value: "checklist", icon: CheckSquare },
                  { name: "+ Options", value: "radio", icon: List }
                ].map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => addBlock(btn.value)}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-white shadow-xs transition-all duration-150 whitespace-nowrap"
                  >
                    <btn.icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{btn.name}</span>
                  </button>
                ))}
              </div>

              {/* Note Content Canvas (Without outer text borders) */}
              <div className="space-y-4 flex-1">
                {blocks.map((block, bIdx) => (
                  <div 
                    key={bIdx} 
                    className="group relative flex items-start gap-3 py-1 border-l border-transparent hover:border-slate-200 pl-3 -ml-3 rounded-r-xl transition-all"
                  >
                    {/* Reordering Block Handles (visible on hover) */}
                    <div className="flex flex-col gap-0.5 items-center opacity-0 group-hover:opacity-100 transition-opacity absolute -left-5 top-1/2 -translate-y-1/2">
                      <button 
                        onClick={() => moveBlock(bIdx, 'up')}
                        disabled={bIdx === 0}
                        className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => moveBlock(bIdx, 'down')}
                        disabled={bIdx === blocks.length - 1}
                        className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Block rendering */}
                    <div className="flex-1 min-w-0">
                      {block.type === 'paragraph' && (
                        <textarea
                          value={block.content}
                          onChange={(e) => {
                            updateBlockContent(bIdx, e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          onFocus={(e) => {
                            setActiveBlockIndex(bIdx);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          ref={(el) => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = el.scrollHeight + 'px';
                            }
                          }}
                          className={`w-full bg-transparent focus:outline-none resize-none min-h-[120px] text-[#2d2d3a] leading-[1.8] placeholder:text-slate-400/50 border-none p-0 focus:ring-0 ${getFontSizeClass()}`}
                          placeholder="Start writing..."
                        />
                      )}

                      {block.type === 'checklist' && (
                        <div className="space-y-2">
                          {block.items.map((item, iIdx) => (
                            <div key={iIdx} className="flex items-center gap-2 group/item">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => toggleSubitemState(bIdx, iIdx)}
                                className="w-4 h-4 rounded-md border-slate-300 text-indigo-650 focus:ring-indigo-500/20 cursor-pointer animate-pulse"
                              />
                              <input
                                type="text"
                                value={item.text}
                                onChange={(e) => updateSubitemText(bIdx, iIdx, e.target.value)}
                                onFocus={() => setActiveBlockIndex(bIdx)}
                                className={`flex-1 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none text-slate-700 text-sm ${
                                  item.checked ? 'line-through text-slate-400' : ''
                                }`}
                                placeholder="Task description"
                              />
                              <button
                                onClick={() => removeSubitem(bIdx, iIdx)}
                                className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addSubitem(bIdx)}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add item
                          </button>
                        </div>
                      )}

                      {block.type === 'radio' && (
                        <div className="space-y-2">
                          {block.items.map((item, iIdx) => (
                            <div key={iIdx} className="flex items-center gap-2 group/item">
                              <input
                                type="radio"
                                name={`radio-group-${bIdx}`}
                                checked={item.selected}
                                onChange={() => toggleSubitemState(bIdx, iIdx)}
                                className="w-4 h-4 border-slate-300 text-indigo-650 focus:ring-indigo-500/20 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={item.text}
                                onChange={(e) => updateSubitemText(bIdx, iIdx, e.target.value)}
                                onFocus={() => setActiveBlockIndex(bIdx)}
                                className="flex-1 bg-transparent border-b border-transparent focus:border-slate-350 focus:outline-none text-slate-700 text-sm"
                                placeholder="Radio option"
                              />
                              <button
                                onClick={() => removeSubitem(bIdx, iIdx)}
                                className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addSubitem(bIdx)}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add option
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Delete Block (Right) */}
                    <button 
                      onClick={() => removeBlock(bIdx)}
                      disabled={blocks.length === 1}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-200 hover:bg-rose-50 hover:border-rose-100 text-slate-400 hover:text-rose-500 transition-all flex-shrink-0 disabled:opacity-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="px-4 sm:px-8 py-4 sm:py-5 bg-white border-t border-slate-100/55 flex items-center justify-between gap-4 flex-wrap flex-shrink-0">
          <div>
            {reminder && (
              <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50/60 border border-indigo-100/30 px-3 py-1 rounded-full">
                Reminds you on {formatReminderDate(reminder)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-sm font-medium text-[#6b7280] hover:text-slate-800 hover:underline bg-transparent border-none py-2 px-4 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-white rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 shadow-md shadow-indigo-950/10 hover:shadow-lg transition-all duration-200 disabled:opacity-70 active:scale-97 cursor-pointer"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>{note ? 'Save Changes' : 'Upload Note'}</span>
            </button>
          </div>
        </div>

      </div>
  );
}
export default NoteEditor;
