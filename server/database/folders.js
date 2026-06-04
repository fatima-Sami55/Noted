const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'folders.json');

const DEFAULT_FOLDERS = [
  { name: 'Personal', starred: true },
  { name: 'Ideas', starred: true },
  { name: 'Tasks', starred: false }
];

function getFoldersStore() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '{}', 'utf8');
      return {};
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '{}');
  } catch (e) {
    console.error("Failed to read folders.json:", e);
    return {};
  }
}

function saveFoldersStore(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error("Failed to save folders.json:", e);
  }
}

module.exports = {
  getFolders(userId) {
    const store = getFoldersStore();
    if (!store[userId]) {
      // Initialize with defaults
      store[userId] = JSON.parse(JSON.stringify(DEFAULT_FOLDERS));
      saveFoldersStore(store);
    }
    return store[userId];
  },
  
  createFolder(userId, name) {
    const store = getFoldersStore();
    if (!store[userId]) {
      store[userId] = JSON.parse(JSON.stringify(DEFAULT_FOLDERS));
    }
    // Prevent duplicate folder names (case-insensitive)
    const exists = store[userId].some(f => f.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      store[userId].push({ name, starred: false });
      saveFoldersStore(store);
      return { success: true, folders: store[userId] };
    }
    return { success: false, error: 'Folder already exists' };
  },

  toggleStarFolder(userId, name) {
    const store = getFoldersStore();
    if (!store[userId]) {
      store[userId] = JSON.parse(JSON.stringify(DEFAULT_FOLDERS));
    }
    const folder = store[userId].find(f => f.name.toLowerCase() === name.toLowerCase());
    if (folder) {
      folder.starred = !folder.starred;
      saveFoldersStore(store);
      return { success: true, folders: store[userId] };
    }
    return { success: false, error: 'Folder not found' };
  },

  deleteFolder(userId, name) {
    const store = getFoldersStore();
    if (!store[userId]) {
      store[userId] = JSON.parse(JSON.stringify(DEFAULT_FOLDERS));
    }
    // Don't allow deleting default folders
    const isDefault = DEFAULT_FOLDERS.some(f => f.name.toLowerCase() === name.toLowerCase());
    if (isDefault) {
      return { success: false, error: 'Cannot delete default folders' };
    }
    
    store[userId] = store[userId].filter(f => f.name.toLowerCase() !== name.toLowerCase());
    saveFoldersStore(store);
    return { success: true, folders: store[userId] };
  }
};
