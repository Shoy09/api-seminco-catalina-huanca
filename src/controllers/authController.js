require('dotenv').config(); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const db = require('../config/db');


exports.autenticarUsuario = async (req, res) => {
    const { codigo_dni, password } = req.body;

    try {
        
        const [rows] = await db.query('SELECT * FROM usuarios WHERE codigo_dni = ?', [codigo_dni]);
        
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = rows[0];

        
        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return res.status(400).json({ error: 'Credenciales incorrectas' });
        }

        
        const payload = {
            id: usuario.id,
            codigo_dni: usuario.codigo_dni,
            apellidos: usuario.apellidos,
            nombres: usuario.nombres
        };

        
        if (!process.env.JWT_SECRET) {
            throw new Error('La clave secreta (JWT_SECRET) no está configurada');
        }

        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });

        
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error al autenticar al usuario:', error.message);
        res.status(500).json({ error: 'Error al autenticar al usuario' });
    }
};
