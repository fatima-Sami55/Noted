const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'avatars.json');

function getAvatars() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '{}', 'utf8');
      return {};
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '{}');
  } catch (e) {
    return {};
  }
}

function saveAvatars(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error("Failed to save avatars.json:", e);
  }
}

module.exports = {
  getAvatar(userId) {
    const avatars = getAvatars();
    return avatars[userId] || 'avatar'; // Default avatar style
  },
  setAvatar(userId, style) {
    const avatars = getAvatars();
    avatars[userId] = style;
    saveAvatars(avatars);
  }
};
