const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Sostenimiento', // 👈 nueva carpeta
        allowed_formats: ['jpg', 'jpeg', 'png'],
        public_id: (req, file) => {
            const name = file.fieldname; // foto_croquis o dibujo_croquis
            return `${name}_${Date.now()}`;
        }
    }
});

const uploadSostenimiento = multer({ storage });

module.exports = uploadSostenimiento;