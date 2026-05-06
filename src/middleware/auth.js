const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    
    if (!authHeader) {
        return res.status(403).json({ error: 'No se proporcionó el token' });
    }

    
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;

    try {
        
        if (!process.env.JWT_SECRET) {
            throw new Error('La clave secreta (JWT_SECRET) no está configurada');
        }

        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        
        req.user = decoded;

        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'El token ha expirado' });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }

        
        return res.status(500).json({ error: 'Error en la validación del token' });
    }
};

module.exports = verificarToken;
