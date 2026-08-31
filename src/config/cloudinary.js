require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Validar que las credenciales de Cloudinary estén configuradas
if (process.env.NODE_ENV === 'production') {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('❌ Variables de Cloudinary no configuradas en producción');
  }
}

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Exportar Cloudinary para usarlo en otros archivos
module.exports = cloudinary;
