// src/Utils/token.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'cambiame_en_env';

// JWT: access / refresh
const generarAccessToken = (payload) => {
  try {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' });
  } catch (Error) {
    console.error('generarAccessToken:', Error);
    return null;
  }
};

const generarRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
  } catch (Error) {
    console.error('generarRefreshToken:', Error);
    return null;
  }
};

const verificarToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (Error) {
    throw new Error('Token inválido o expirado');
  }
};

// Tokens únicos (no JWT) para validación/recuperación: hex seguro
const generarTokenUnico = (length = 48) => {
  return crypto.randomBytes(length).toString('hex'); // por ejemplo 96 chars si length=48
};

// Código 2FA numérico de 6 dígitos (string)
const generarCodigo2FA = () => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return String(code);
};

// middleware simple (auth JWT)
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ Error: 'Token no proporcionado.' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (Error) {
    return res.status(401).json({ Error: 'Token inválido o expirado.' });
  }
};

module.exports = {
  generarAccessToken,
  generarRefreshToken,
  verificarToken,
  generarTokenUnico,
  generarCodigo2FA,
  authMiddleware
};