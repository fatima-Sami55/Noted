const { v4: uuidv4 } = require('uuid');

const EXPIRY_HOURS = parseInt(process.env.TOKEN_EXPIRY_HOURS || '2');

function generateToken() {
  return uuidv4();
}

function isTokenExpired(tokenCreatedAt) {
  if (!tokenCreatedAt) return true;
  const expiry = new Date(tokenCreatedAt);
  expiry.setHours(expiry.getHours() + EXPIRY_HOURS);
  return new Date() > expiry;
}

function isTokenActive(token, tokenCreatedAt) {
  return token && !isTokenExpired(tokenCreatedAt);
}

function isResendThrottled(tokenCreatedAt, throttleMinutes = 2) {
  if (!tokenCreatedAt) return false;
  const cooldown = new Date(tokenCreatedAt);
  cooldown.setMinutes(cooldown.getMinutes() + throttleMinutes);
  return new Date() < cooldown;
}

function getResendAvailableAt(tokenCreatedAt, throttleMinutes = 2) {
  const resendAt = new Date(tokenCreatedAt);
  resendAt.setMinutes(resendAt.getMinutes() + throttleMinutes);
  return resendAt.toLocaleString('en-US', {
    dateStyle: 'long', timeStyle: 'short'
  });
}

module.exports = { 
  generateToken, 
  isTokenExpired, 
  isTokenActive,
  isResendThrottled,
  getResendAvailableAt 
};

