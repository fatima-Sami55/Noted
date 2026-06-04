import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { NoteEditor } from './components/NoteEditor';
import { NoteViewer } from './components/NoteViewer';
import { FolderCard } from './components/FolderCard';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { Search, Grid, List as ListIcon, Plus, Sparkles, Menu, ShieldAlert, Home, Calendar as CalendarIcon, User, X, LogOut } from 'lucide-react';
import { WeekCalendar } from './components/WeekCalendar';


export function App() {
  // Session & Authentication State
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  // Notes and UI State
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeTag, setActiveTag] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'title' | 'color'
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState('grid'); // 'grid' | 'list'

  // Responsive Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Read Viewer State
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);

  const searchInputRef = useRef(null);

  // Check login session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Fetch notes when user logs in
  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchFolders();
    }
  }, [user]);

  // Helper to trigger toast alerts
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const isDateInPast = (d) => {
    if (!d) return false;
    const today = new Date();
    const checkD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const currentD = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkD < currentD;
  };

  const getAvatarUrl = (avatarId) => {
    if (!avatarId || avatarId === 'avatar') {
      return '/avatars/avatar.png';
    }
    return `/avatars/${avatarId}.png`;
  };

  const checkSession = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Session check failed:", e);
      setUser(null);
    } finally {
      setLoadingSession(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error("Failed to load notes:", e);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/folders');
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
      }
    } catch (e) {
      console.error("Failed to load folders:", e);
    }
  };

  const handleCreateFolder = async (folderName) => {
    const tempFolder = { name: folderName, starred: false };
    const originalFolders = [...folders];
    setFolders(prev => [...prev, tempFolder]);

    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName })
      });
      if (res.ok) {
        const updatedFolders = await res.json();
        setFolders(updatedFolders);
        showToast('List created successfully!');
      } else {
        setFolders(originalFolders);
        const data = await res.json();
        showToast(data.error || 'Failed to create list', 'error');
      }
    } catch (e) {
      setFolders(originalFolders);
      console.error("Failed to create folder:", e);
      showToast('Connection error', 'error');
    }
  };

  const handleToggleStarFolder = async (folderName) => {
    const originalFolders = [...folders];
    setFolders(prev => prev.map(f => f.name.toLowerCase() === folderName.toLowerCase() ? { ...f, starred: !f.starred } : f));

    try {
      const res = await fetch(`/api/folders/${encodeURIComponent(folderName)}/star`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updatedFolders = await res.json();
        setFolders(updatedFolders);
      } else {
        setFolders(originalFolders);
        showToast('Failed to toggle star', 'error');
      }
    } catch (e) {
      setFolders(originalFolders);
      console.error("Failed to star folder:", e);
    }
  };

  const handleDeleteFolder = async (folderName) => {
    const originalFolders = [...folders];
    setFolders(prev => prev.filter(f => f.name.toLowerCase() !== folderName.toLowerCase()));
    const originalActiveTag = activeTag;
    if (activeTag === folderName) {
      setActiveTag('All');
    }

    try {
      const res = await fetch(`/api/folders/${encodeURIComponent(folderName)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updatedFolders = await res.json();
        setFolders(updatedFolders);
        showToast('List deleted successfully!');
      } else {
        setFolders(originalFolders);
        setActiveTag(originalActiveTag);
        const data = await res.json();
        showToast(data.error || 'Failed to delete list', 'error');
      }
    } catch (e) {
      setFolders(originalFolders);
      setActiveTag(originalActiveTag);
      console.error("Failed to delete folder:", e);
      showToast('Connection error', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout');
      if (res.ok) {
        setUser(null);
        setNotes([]);
        showToast('Successfully logged out!');
      } else {
        showToast('Logout failed', 'error');
      }
    } catch (e) {
      console.error("Logout failed:", e);
      showToast('Logout failed', 'error');
    }
  };

  // Create or Update Note Action
  const handleSaveNote = async (notePayload) => {
    const isEditing = !!editingNote;
    const tempId = isEditing ? editingNote.noteid : Date.now();

    const optimisticNote = {
      noteid: tempId,
      heading: notePayload.heading,
      body: notePayload.body,
      color: notePayload.color,
      style: notePayload.style,
      created_at: isEditing ? editingNote.created_at : new Date().toISOString(),
      date: isEditing ? editingNote.date : new Date().toISOString()
    };

    const previousNotes = [...notes];

    // Optimistically update notes state immediately
    if (isEditing) {
      setNotes(prev => prev.map(n => n.noteid === editingNote.noteid ? { ...n, ...optimisticNote } : n));
    } else {
      setNotes(prev => [optimisticNote, ...prev]);
    }

    // Close editor view immediately for instant UI feedback
    setIsEditorOpen(false);
    setEditingNote(null);

    try {
      const url = isEditing ? `/api/notes/${editingNote.noteid}` : '/api/notes';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notePayload)
      });

      if (res.ok) {
        const savedNote = await res.json();
        if (!isEditing && savedNote && savedNote.noteid) {
          setNotes(prev => prev.map(n => n.noteid === tempId ? savedNote : n));
        } else {
          fetchNotes();
        }
        showToast(isEditing ? 'Note updated successfully!' : 'Note created successfully!');
      } else {
        setNotes(previousNotes);
        const errData = await res.json();
        showToast(errData.error || 'Failed to save note', 'error');
      }
    } catch (e) {
      console.error("Error saving note:", e);
      setNotes(previousNotes);
      showToast('Connection error while saving note', 'error');
    }
  };

  // Delete Note Action
  const handleDeleteNote = async (noteid) => {
    try {
      const res = await fetch(`/api/notes/${noteid}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchNotes();
        showToast('Note deleted successfully!');
      } else {
        showToast('Failed to delete note', 'error');
      }
    } catch (e) {
      console.error("Error deleting note:", e);
      showToast('Connection error while deleting note', 'error');
    }
  };

  const handleUpdateNoteBody = async (noteid, bodyObj) => {
    const targetNote = notes.find(n => n.noteid === noteid);
    if (!targetNote) return;

    const originalNotes = [...notes];
    const updatedBodyStr = JSON.stringify(bodyObj);

    // Optimistically update local notes and viewingNote states immediately
    setNotes(prev => prev.map(n => n.noteid === noteid ? { ...n, body: updatedBodyStr } : n));
    setViewingNote(prev => {
      if (prev && prev.noteid === noteid) {
        return { ...prev, body: updatedBodyStr };
      }
      return prev;
    });

    const payload = {
      heading: targetNote.heading,
      body: updatedBodyStr,
      color: targetNote.color,
      style: targetNote.style
    };

    try {
      const res = await fetch(`/api/notes/${noteid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        setNotes(originalNotes);
        setViewingNote(targetNote);
        showToast('Failed to sync checklist changes', 'error');
      }
    } catch (e) {
      console.error("Failed to update note body:", e);
      setNotes(originalNotes);
      setViewingNote(targetNote);
      showToast('Connection error while updating checklist', 'error');
    }
  };

  const openNewEditor = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const openEditEditor = (note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleOpenViewer = (note) => {
    setViewingNote(note);
    setIsViewerOpen(true);
  };

  const handleEditFromViewer = (note) => {
    setIsViewerOpen(false);
    openEditEditor(note);
  };

  const handleDeleteFromViewer = async (noteid) => {
    await handleDeleteNote(noteid);
    setIsViewerOpen(false);
    setViewingNote(null);
  };

  // Note Filtering Logic
  const getFilteredNotes = () => {
    return notes.filter(note => {
      // 1. Tag/Sticker Category Filter
      if (activeTag !== 'All') {
        const isStyleMatch = note.style && note.style.toLowerCase() === activeTag.toLowerCase();
        
        let isStickerMatch = false;
        try {
          const parsed = typeof note.body === 'string' ? JSON.parse(note.body) : note.body;
          if (parsed && parsed.sticker === activeTag) {
            isStickerMatch = true;
          }
        } catch (e) { }

        if (!isStyleMatch && !isStickerMatch) return false;
      }

      // 2. Calendar Reminder Date Filter
      if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const calDateStr = `${year}-${month}-${day}`;

        let reminderMatch = false;
        try {
          const parsed = typeof note.body === 'string' ? JSON.parse(note.body) : note.body;
          if (parsed && parsed.reminder && parsed.reminder.substring(0, 10) === calDateStr) {
            reminderMatch = true;
          }
        } catch (e) { }

        if (!reminderMatch) return false;
      }

      // 3. Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = note.heading.toLowerCase().includes(query);
        
        let bodyMatch = false;
        try {
          const parsed = typeof note.body === 'string' ? JSON.parse(note.body) : note.body;
          if (parsed && parsed.blocks) {
            bodyMatch = parsed.blocks.some(block => {
              if (block.type === 'paragraph' && block.content.toLowerCase().includes(query)) return true;
              if (block.items) {
                return block.items.some(item => item.text.toLowerCase().includes(query));
              }
              return false;
            });
          }
        } catch (e) {
          bodyMatch = note.body && note.body.toLowerCase().includes(query);
        }

        if (!titleMatch && !bodyMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      // 4. Sorting Logic
      if (sortBy === 'title') {
        return a.heading.localeCompare(b.heading);
      }
      if (sortBy === 'color') {
        return (a.color || '').localeCompare(b.color || '');
      }
      return b.noteid - a.noteid;
    });
  };

  const filteredNotes = getFilteredNotes();

  const getPageHeading = () => {
    if (selectedDate) {
      const monthName = selectedDate.toLocaleString('en-US', { month: 'long' });
      return `Notes for ${monthName} ${selectedDate.getDate()}`;
    }
    if (activeTag !== 'All') {
      return `${activeTag} Memos`;
    }
    return "My Digital Cards";
  };

  // Loading indicator for checking session
  if (loadingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f8f5]">
        <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm mt-4 animate-pulse">Connecting...</p>
      </div>
    );
  }

  // Not Logged In / Public pages loading check
  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f8f5]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public auth pages */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : (
              <Login 
                onAuthSuccess={(userData) => {
                  setUser(userData);
                  showToast(`Welcome back, ${userData.username}!`);
                }} 
                showToast={showToast}
              />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? <Navigate to="/" replace /> : (
              <Register 
                onAuthSuccess={(userData) => {
                  setUser(userData);
                  showToast(`Account created! Welcome, ${userData.username}`);
                }} 
                showToast={showToast}
              />
            )
          } 
        />
        <Route path="/verify-email" element={<VerifyEmail showToast={showToast} />} />
        <Route path="/forgot-password" element={<ForgotPassword showToast={showToast} />} />
        <Route path="/reset-password" element={<ResetPassword showToast={showToast} />} />

        {/* Protected Dashboard Route */}
        <Route 
          path="/" 
          element={
            !user ? <Navigate to="/login" replace /> : (
              <div className="min-h-screen flex bg-[#f9f8f5] relative pb-20 lg:pb-0">
                
                {/* Sidebar Navigation */}
                <Sidebar
                  notes={notes}
                  user={user}
                  activeTag={activeTag}
                  setActiveTag={setActiveTag}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  onLogout={handleLogout}
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                  onUpdateUser={(updated) => setUser(updated)}
                  folders={folders}
                  onCreateFolder={handleCreateFolder}
                  onToggleStarFolder={handleToggleStarFolder}
                  onDeleteFolder={handleDeleteFolder}
                />

                {/* Backdrop overlay for mobile drawer */}
                {isSidebarOpen && (
                  <div 
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 transition-all duration-300"
                  />
                )}

                {/* Main Panel or Note Editor Page */}
                {isEditorOpen ? (
                  <NoteEditor
                    note={editingNote}
                    onSave={handleSaveNote}
                    onClose={() => {
                      setIsEditorOpen(false);
                      setEditingNote(null);
                    }}
                    defaultCategory={activeTag && activeTag !== 'All' ? activeTag : 'Personal'}
                    folders={folders}
                  />
                ) : (
                  <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-h-screen overflow-y-auto w-full">
                    
                    {/* Top Navbar */}
                    <header className="flex flex-col lg:flex-row items-center justify-between gap-4 w-full">
                      
                      <div className="flex items-center justify-between lg:justify-start gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-3 flex-1 lg:flex-none">
                          {/* Hamburger menu button for mobile */}
                          <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl bg-white hover:bg-slate-55 border border-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer flex-shrink-0"
                          >
                            <Menu className="w-5 h-5" />
                          </button>

                          {/* Redesigned Search bar (480px wide) */}
                          <div className="relative w-full max-w-[480px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search notes..."
                              className="w-full max-w-[480px] pl-11 pr-4 py-2.5 text-sm font-medium rounded-full border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 bg-white transition-all placeholder:text-slate-400 text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                            />
                          </div>
                        </div>

                        {/* Responsive profile avatar and logout for small devices */}
                        <div className="flex lg:hidden items-center gap-2.5 flex-shrink-0">
                          <img 
                            src={getAvatarUrl(user.avatar || 'avatar')} 
                            alt="Profile Avatar" 
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-9 h-9 rounded-full border border-slate-200 bg-slate-50 object-contain cursor-pointer hover:border-indigo-400 transition-colors"
                          />
                          <button
                            onClick={handleLogout}
                            title="Log Out"
                            className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer border border-slate-200 bg-white"
                          >
                            <LogOut className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>

                      {/* Controls Bar (Sort dropdown, Toggle view, Add Note) */}
                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start sm:justify-end">
                        
                        {/* Sorting Dropdown (pill chip style) */}
                        <div className="flex items-center gap-1.5 bg-white p-2 px-3.5 rounded-full border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <span className="text-xs font-semibold text-slate-400 select-none">Sort:</span>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-xs font-semibold text-slate-600 bg-transparent focus:outline-none cursor-pointer pr-1"
                          >
                            <option value="date">Date</option>
                            <option value="title">Title</option>
                            <option value="color">Color</option>
                          </select>
                        </div>

                        {/* Grid/List View toggle */}
                        <div className="flex bg-white p-1 rounded-full border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <button
                            onClick={() => setViewType('grid')}
                            className={`p-1.5 rounded-full transition-all cursor-pointer ${
                              viewType === 'grid' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                            }`}
                            title="Grid View"
                          >
                            <Grid className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewType('list')}
                            className={`p-1.5 rounded-full transition-all cursor-pointer ${
                              viewType === 'list' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                            }`}
                            title="List View"
                          >
                            <ListIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {!isDateInPast(selectedDate) && (
                          <button
                            onClick={openNewEditor}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium text-sm flex items-center gap-2 shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-96"
                          >
                            <Plus className="w-4 h-4" /> Create Note
                          </button>
                        )}
                      </div>
                    </header>

                    {/* Horizontal Calendar Bar (relocated to upper bar) */}
                    <div className="w-full flex justify-start px-1 select-none">
                      <WeekCalendar
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        notes={notes}
                      />
                    </div>

                    {/* Dashboard Title & Stats bar */}
                    <section className="flex flex-col gap-1.5 px-1 pt-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-serif font-bold text-slate-800">
                          {getPageHeading()}
                        </h2>
                        {/* Date filter clear chip */}
                        {selectedDate && (
                          <button
                            onClick={() => setSelectedDate(null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer shadow-xs border border-indigo-100/30"
                          >
                            <span>{selectedDate.toLocaleString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Category filter clear chip */}
                        {activeTag !== 'All' && !selectedDate && (
                          <button
                            onClick={() => setActiveTag('All')}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200/20"
                          >
                            <span>{activeTag} ×</span>
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-400 font-sans">
                        Showing {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} 
                      </p>
                    </section>

                    {/* Cards Grid/List Render */}
                    {filteredNotes.length > 0 ? (
                      <div className={
                        viewType === 'grid' 
                          ? 'grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6 w-full pb-16'
                          : 'flex flex-col gap-4 w-full pb-16'
                      }>
                        {filteredNotes.map((note) => (
                          <NoteCard
                            key={note.noteid}
                            note={note}
                            onEdit={openEditEditor}
                            onDelete={handleDeleteNote}
                            onClick={handleOpenViewer}
                            viewType={viewType}
                          />
                        ))}

                        {/* Add Note Dashed Card shortcut */}
                        {viewType === 'grid' && !isDateInPast(selectedDate) && (
                          <div 
                            onClick={openNewEditor}
                            className="border-2 border-dashed border-[#d1d5db] hover:border-indigo-600 rounded-[20px] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-indigo-50/10 hover:scale-[0.98] transition-all duration-300 min-h-[300px] w-full bg-white/20 select-none group"
                          >
                            <div className="w-12 h-12 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600/10 group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all">
                              <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">Add Note</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white/30 backdrop-blur-md rounded-[20px] border border-[#ede9e3]/60 shadow-xs min-h-[350px] w-full pb-16">
                        {isDateInPast(selectedDate) ? (
                          <div className="w-12 h-12 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center mb-4">
                            <CalendarIcon className="w-6 h-6" />
                          </div>
                        ) : (
                          <div 
                            onClick={openNewEditor}
                            className="mb-4 border-2 border-dashed border-[#d1d5db] hover:border-indigo-600 rounded-[16px] p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-indigo-50/10 hover:scale-[0.98] transition-all duration-300 w-32 h-32 bg-white/40 select-none group"
                          >
                            <div className="w-9 h-9 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600/10 group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all">
                              <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">Add Note</span>
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-slate-700 font-serif">No notes found</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm text-center font-medium font-sans">
                          {searchQuery 
                            ? "Try adjusting your search queries or clearing active filters." 
                            : isDateInPast(selectedDate)
                              ? "No notes were recorded for this day."
                              : "Create a note to start custom block text, checklists, and reminders."}
                        </p>
                      </div>
                    )}
                  </main>
                )}

                {/* Note Viewer Slide-over Sheet (Read Mode) */}
                {isViewerOpen && (
                  <NoteViewer
                    note={viewingNote}
                    onEdit={handleEditFromViewer}
                    onDelete={handleDeleteFromViewer}
                    onUpdateBody={handleUpdateNoteBody}
                    onClose={() => {
                      setIsViewerOpen(false);
                      setViewingNote(null);
                    }}
                  />
                )}

                {/* Mobile Bottom Navigation Bar (64px tall, fixed bottom) */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#ede9e3] z-40 flex items-center justify-around px-2 shadow-lg select-none">
                  <button 
                    onClick={() => {
                      setActiveTag('All');
                      setSelectedDate(null);
                      setSearchQuery('');
                    }}
                    className={`flex flex-col items-center justify-center p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer ${
                      activeTag === 'All' && !selectedDate ? 'text-indigo-600' : ''
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] font-sans font-medium mt-0.5">Home</span>
                  </button>

                  <button 
                    onClick={() => {
                      if (searchInputRef.current) {
                        searchInputRef.current.focus();
                      }
                    }}
                    className="flex flex-col items-center justify-center p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <Search className="w-5 h-5" />
                    <span className="text-[10px] font-sans font-medium mt-0.5">Search</span>
                  </button>

                  {!isDateInPast(selectedDate) && (
                    <button 
                      onClick={openNewEditor}
                      className="flex flex-col items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      setSelectedDate(new Date());
                      setActiveTag('All');
                    }}
                    className={`flex flex-col items-center justify-center p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer ${
                      selectedDate ? 'text-indigo-600' : ''
                    }`}
                  >
                    <CalendarIcon className="w-5 h-5" />
                    <span className="text-[10px] font-sans font-medium mt-0.5">Calendar</span>
                  </button>

                  <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex flex-col items-center justify-center p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <img 
                      src={getAvatarUrl(user.avatar || 'avatar')} 
                      alt="Profile" 
                      className="w-5 h-5 rounded-full border border-slate-200 object-contain bg-slate-50"
                    />
                    <span className="text-[10px] font-sans font-medium mt-0.5">Profile</span>
                  </button>
                </nav>

              </div>
            )
          } 
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-20 lg:bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-slide-in ${
          toast.type === 'error'
            ? 'bg-rose-50/95 text-rose-700 border-rose-100/60 shadow-rose-100/10'
            : 'bg-emerald-50/95 text-emerald-700 border-emerald-100/60 shadow-emerald-100/10'
        }`}>
          {toast.type === 'error' ? (
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-500" />
          ) : (
            <Sparkles className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          )}
          <span className="text-sm font-bold tracking-tight">{toast.message}</span>
        </div>
      )}
    </>
  );
}
export default App;

