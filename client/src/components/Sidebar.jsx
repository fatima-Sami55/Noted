import React, { useState } from 'react';
import { LogOut, Calendar, User, X, FileText, CheckSquare, Star, ChevronDown, Palette, Folder, Trash2, Plus, Check } from 'lucide-react';
import logoImg from '../assets/logo.png';

const AVATAR_STYLES = [
  { id: 'avatar', name: 'Default' },
  { id: 'cat', name: 'Cat' },
  { id: 'panda', name: 'Panda' },
  { id: 'fox', name: 'Fox' },
  { id: 'dog', name: 'Dog' },
  { id: 'giraffe', name: 'Giraffe' },
  { id: 'penguin', name: 'Penguin' }
];

export function Sidebar({ 
  notes, 
  user, 
  activeTag, 
  setActiveTag, 
  selectedDate, 
  setSelectedDate, 
  onLogout,
  isOpen,
  onClose,
  onUpdateUser,
  folders = [],
  onCreateFolder,
  onToggleStarFolder,
  onDeleteFolder
}) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(user?.avatar || 'avatar');
  const [savingAvatar, setSavingAvatar] = useState(false);
  
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolderSubmit = (e) => {
    e.preventDefault();
    if (newFolderName.trim() === '') return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  const getFolderDisplayName = (folderName) => {
    if (folderName.toLowerCase() === 'personal') return 'Journal';
    return folderName;
  };

  const starredFolders = folders.filter(f => f.starred);
  const customFolders = folders.filter(f => {
    const nameLower = f.name.toLowerCase();
    return nameLower !== 'work' && nameLower !== 'personal' && nameLower !== 'ideas' && nameLower !== 'tasks';
  });

  const handleSaveAvatar = async () => {
    if (!user) return;
    const originalStyle = user.avatar || 'avatar';
    
    // Optimistically update
    onUpdateUser({ ...user, avatar: selectedStyle });
    setShowAvatarPicker(false);

    try {
      const res = await fetch('/api/me/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style: selectedStyle })
      });
      if (!res.ok) {
        onUpdateUser({ ...user, avatar: originalStyle });
      }
    } catch (e) {
      console.error("Failed to save avatar style:", e);
      onUpdateUser({ ...user, avatar: originalStyle });
    }
  };

  const getAvatarUrl = (avatarId) => {
    if (!avatarId || avatarId === 'avatar') {
      return '/avatars/avatar.png';
    }
    return `/avatars/${avatarId}.png`;
  };

  return (
    <aside 
      className={`bg-white border-r border-[#e8e4de] flex flex-col justify-between h-screen fixed lg:sticky top-0 left-0 z-40 transition-all duration-300 ease-out group/sidebar overflow-x-hidden pb-16 lg:pb-0 ${
        isOpen ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full lg:w-[260px] lg:translate-x-0'
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0 space-y-6 p-5 overflow-y-auto pr-2 scrollbar-none">
        
        {/* App Logo Area */}
        <div className="px-2 pt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-serif italic text-slate-800 tracking-tight flex items-center select-none font-bold">
              noted.
            </span>
            {/* Hand-drawn underline SVG */}
            <svg width="65" height="6" viewBox="0 0 65 6" fill="none" className="mt-1 flex-shrink-0 text-indigo-500">
              <path d="M3 4.5C12 2.2 28 1.8 62 3.8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl hover:bg-slate-55/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Categories Section */}
        <div className="space-y-1 pt-2">
          {[
            { name: "All Docs", value: "All", icon: FileText },
            { name: "Task", value: "Tasks", icon: CheckSquare },
            { name: "Calendar", value: "Calendar", icon: Calendar }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = (item.value === 'Calendar' && selectedDate !== null) || 
                             (item.value !== 'Calendar' && selectedDate === null && activeTag === item.value);

            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.value === 'Calendar') {
                    setSelectedDate(new Date()); // Today
                    setActiveTag('All');
                  } else {
                    setActiveTag(item.value);
                    setSelectedDate(null); // Clear date filter
                  }
                  if (onClose) onClose();
                }}
                className={`w-full h-[44px] flex items-center gap-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-800 font-semibold'
                    : 'text-slate-500 hover:bg-[#f5f5f0] hover:text-slate-800'
                }`}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Starred Folders Section */}
        <div className="space-y-2 pt-2">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] px-4">
            Starred
          </h2>
          <div className="space-y-1">
            {starredFolders.map((folder) => {
              const isActive = selectedDate === null && activeTag === folder.name;
              const displayName = getFolderDisplayName(folder.name);

              return (
                <button
                  key={folder.name}
                  onClick={() => {
                    setActiveTag(folder.name);
                    setSelectedDate(null);
                    if (onClose) onClose();
                  }}
                  className={`w-full h-[44px] flex items-center gap-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-800 font-semibold'
                      : 'text-slate-500 hover:bg-[#f5f5f0] hover:text-slate-800'
                  }`}
                >
                  <Star className="w-[18px] h-[18px] flex-shrink-0 text-amber-500 fill-amber-500" />
                  <span className="whitespace-nowrap">
                    {displayName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Folders Section */}
        <div className="space-y-2 pt-4 border-t border-[#f2eee8]">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] px-4">
            Folders
          </h2>
          <div className="space-y-1">
            {customFolders.map((folder) => {
              const isActive = selectedDate === null && activeTag === folder.name;
              return (
                <div
                  key={folder.name}
                  className={`w-full h-[44px] flex items-center justify-between px-4 rounded-xl text-sm font-medium transition-all group/item hover:bg-[#f5f5f0] ${
                    isActive ? 'bg-indigo-50 text-indigo-800 font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <button
                    onClick={() => {
                      setActiveTag(folder.name);
                      setSelectedDate(null);
                      if (onClose) onClose();
                    }}
                    className="flex items-center gap-3 flex-1 text-left h-full cursor-pointer overflow-hidden"
                  >
                    <Folder className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="whitespace-nowrap truncate">
                      {folder.name}
                    </span>
                  </button>
                  
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={() => onToggleStarFolder(folder.name)}
                      className={`p-1 rounded-md cursor-pointer transition-colors ${
                        folder.starred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                      }`}
                      title={folder.starred ? "Unstar folder" : "Star folder"}
                    >
                      <Star className={`w-3.5 h-3.5 ${folder.starred ? 'fill-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => onDeleteFolder(folder.name)}
                      className="p-1 rounded-md text-slate-350 hover:text-rose-500 cursor-pointer"
                      title="Delete folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {/* Inline folder creation form */}
            {isAddingFolder ? (
              <form onSubmit={handleCreateFolderSubmit} className="px-3 py-1.5 flex items-center gap-1.5">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New list name..."
                  autoFocus
                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                />
                <button type="submit" className="p-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 cursor-pointer">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setIsAddingFolder(false)} className="p-1 bg-slate-50 text-slate-400 rounded-md hover:bg-slate-100 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingFolder(true)}
                className="w-full h-[40px] flex items-center gap-3 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#f5f5f0] hover:text-slate-650 transition-all cursor-pointer"
              >
                <Plus className="w-[16px] h-[16px] flex-shrink-0" />
                <span className="whitespace-nowrap">
                  New List
                </span>
              </button>
            )}
          </div>
        </div>


      </div>

      {/* User Section / Avatar Controller */}
      {user && (
        <div className="p-4 border-t border-[#ede9e3] relative bg-white flex-shrink-0">
          <div className="flex items-center justify-between gap-2.5">
            <div 
              onClick={() => {
                setSelectedStyle(user.avatar || 'avatar');
                setShowAvatarPicker(!showAvatarPicker);
              }}
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer group/avatar max-w-[80%]"
            >
              <img 
                src={getAvatarUrl(user.avatar || 'avatar')} 
                alt="Profile Avatar" 
                className="w-10 h-10 rounded-full border border-slate-200 flex-shrink-0 bg-slate-50 object-contain hover:border-indigo-400 transition-colors"
              />
              <div className="overflow-hidden leading-tight">
                <p className="text-sm font-semibold text-slate-700 truncate group-hover/avatar:text-indigo-650 transition-colors">
                  {user.username}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Log Out"
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* DiceBear Avatar Picker Popover */}
          {showAvatarPicker && (
            <div className="absolute bottom-16 left-4 right-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-4 z-50 animate-[scaleIn_0.18s_ease-out] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-serif italic text-lg text-slate-800 font-bold">Choose your look</span>
                <button 
                  onClick={() => setShowAvatarPicker(false)}
                  className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3x2 Grid for Avatar Styles */}
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_STYLES.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  return (
                    <div 
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className="flex flex-col items-center gap-1 cursor-pointer group"
                    >
                      <div className={`w-[60px] h-[60px] rounded-full overflow-hidden border flex items-center justify-center bg-slate-50 transition-all ${
                        isSelected 
                          ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105 border-transparent' 
                          : 'border-slate-200 hover:border-indigo-400'
                      }`}>
                        <img 
                          src={getAvatarUrl(style.id)} 
                          alt={style.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[9px] font-sans text-slate-400 font-medium truncate max-w-full text-center">
                        {style.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Avatar Picker Action Footer */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveAvatar}
                  disabled={savingAvatar}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {savingAvatar ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
export default Sidebar;
