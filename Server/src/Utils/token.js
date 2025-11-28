const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

// ================================
// TOKEN DE ACCESO (sesión)
// ================================
const generarAccessToken = (payload) => {
    try {
        return jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' });
    } catch (Error) {
        console.error(Error);
        return null;
    }
};

// ================================
// REFRESH TOKEN (larga duración)
// ================================
const generarRefreshToken = (payload) => {
    try {
        return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
    } catch (Error) {
        console.error(Error);
        return null;
    }
};

// ================================
// VERIFICAR TOKEN
// ================================
const verificarToken = (token) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (Error) {
        throw new Error('Token inválido o expirado');
    }
};

// ================================
// MIDDLEWARE AUTH
// ================================
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader)
            return res.status(401).json({ Error: 'Token no proporcionado.' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;

        next();
    } catch (Error) {
        return res.status(401).json({ Error: 'Token inválido o expirado.' });
    }
};

// ================================
// MIDDLEWARE ROLES
// ================================
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ Error: 'No tienes permisos para esta acción.' });
        }
        next();
    };
};

module.exports = {
    generarAccessToken,
    generarRefreshToken,
    verificarToken,
    authMiddleware,
    verificarRol
};