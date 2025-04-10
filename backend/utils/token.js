// 📁 utils/token.js
const tokens = new Map();         // email => { token, expiresAt }
const reverseLookup = new Map();  // token => email

function generateToken() {
  return Math.random().toString(36).substring(2, 15);
}

function storeToken(email, token) {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min
  tokens.set(email, { token, expiresAt });
  reverseLookup.set(token, email);
}

function isValidToken(email, token) {
  const data = tokens.get(email);
  if (!data) return false;
  if (data.token !== token) return false;
  if (Date.now() > data.expiresAt) return false;
  return true;
}

function getEmailFromToken(token) {
  return reverseLookup.get(token);
}

function generateSessionToken(email) {
  // Tu peux remplacer ça par un vrai JWT plus tard
  return `${email}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

module.exports = {
  generateToken,
  storeToken,
  isValidToken,
  getEmailFromToken,
  generateSessionToken
};
