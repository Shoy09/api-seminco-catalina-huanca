require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('=== CLOUDINARY CONFIG ===');
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('API_SECRET length:', process.env.CLOUDINARY_API_SECRET?.length);
console.log('API_SECRET value:', process.env.CLOUDINARY_API_SECRET);
console.log('=========================');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Exportar Cloudinary para usarlo en otros archivos
module.exports = cloudinary;
