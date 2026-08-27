const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'pdf-operaciones',
      resource_type: 'raw',
      format: 'pdf',
      public_id: `doc_${Date.now()}`
    };
  }
});


const uploadPdf = multer({ storage });

module.exports = uploadPdf;
