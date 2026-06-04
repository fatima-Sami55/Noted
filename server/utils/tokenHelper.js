const { v4: uuidv4 } = require('uuid');

const EXPIRY_HOURS = parseInt(process.env.TOKEN_EXPIRY_HOURS || '16');

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

function getResendAvailableAt(tokenCreatedAt) {
  const resendAt = new Date(tokenCreatedAt);
  resendAt.setHours(resendAt.getHours() + EXPIRY_HOURS);
  return resendAt.toLocaleString('en-US', {
    dateStyle: 'long', timeStyle: 'short'
  });
}

module.exports = { 
  generateToken, 
  isTokenExpired, 
  isTokenActive,
  getResendAvailableAt 
};
