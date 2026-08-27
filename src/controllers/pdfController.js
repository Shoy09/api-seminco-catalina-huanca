const Pdf = require('../models/Pdf');
const Carpeta = require('../models/Carpeta');
const cloudinary = require('../config/cloudinary');
const uploadPdf = require('../config/uploadPdfOperaciones');
const verificarToken = require('../middleware/auth');
const sequelize = require('../config/sequelize');

// GET - Obtener todos los PDFs (incluye datos de la carpeta)
exports.getPdfs = [
    verificarToken,
    async (req, res) => {
        try {
            const pdfs = await Pdf.findAll({
                include: [{ model: Carpeta, as: 'carpeta' }],
                order: [['createdAt', 'DESC']]
            });
            res.json(pdfs);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener los PDF' });
        }
    }
];

// GET - Obtener PDFs por carpeta
exports.getPdfsPorCarpeta = [
    verificarToken,
    async (req, res) => {
        const { carpeta_id } = req.params;
        try {
            const pdfs = await Pdf.findAll({
                where: { carpeta_id },
                include: [{ model: Carpeta, as: 'carpeta' }],
                order: [['createdAt', 'DESC']]
            });
            res.json(pdfs);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al filtrar los PDFs por carpeta' });
        }
    }
];

// POST - Crear PDF
exports.createPdf = [
    verificarToken,
    (req, res, next) => {
        uploadPdf.single('archivo')(req, res, (err) => {
            if (err) {
                console.error('Error en upload:', err);
                return res.status(500).json({ error: 'Error al subir el archivo', details: err.message || err });
            }
            next();
        });
    },
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'Debe subir un archivo PDF' });
        }

        const pdfUrl = req.file.secure_url || req.file.path || req.file.url;
        if (!pdfUrl) {
            return res.status(500).json({ error: 'No se pudo obtener la URL del archivo subido' });
        }

        try {
            const nuevoPdf = await Pdf.create({
                nombre: req.body.nombre,
                carpeta_id: req.body.carpeta_id,
                url_pdf: pdfUrl
            });

            res.status(201).json({
                message: 'PDF subido correctamente',
                pdf: nuevoPdf
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al guardar el PDF' });
        }
    }
];

// PUT - Actualizar un PDF
exports.updatePdf = [
    verificarToken,
    (req, res, next) => {
        uploadPdf.single('archivo')(req, res, (err) => {
            if (err) {
                console.error('Error en upload:', err);
                return res.status(500).json({ error: 'Error al subir el archivo', details: err.message || err });
            }
            next();
        });
    },
    async (req, res) => {
        const { id } = req.params;
        const { nombre, carpeta_id } = req.body;

        try {
            const pdf = await Pdf.findByPk(id);
            if (!pdf) {
                return res.status(404).json({ error: 'PDF no encontrado' });
            }

            let nuevaUrl = pdf.url_pdf;

            if (req.file) {
                nuevaUrl = req.file.path;

                // Eliminar PDF anterior de Cloudinary
                const partes = pdf.url_pdf.split('/');
                const publicIdConExt = partes.pop();
                const publicId = publicIdConExt.split('.')[0];
                await cloudinary.uploader.destroy(`pdf-operaciones/${publicId}`);
            }

            await pdf.update({ nombre, carpeta_id, url_pdf: nuevaUrl });

            res.json({ message: 'PDF actualizado correctamente', pdf });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar el PDF' });
        }
    }
];

// DELETE - Eliminar PDF
exports.deletePdf = [
    verificarToken,
    async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const pdf = await Pdf.findByPk(req.params.id, { transaction: t });
            if (!pdf) {
                await t.rollback();
                return res.status(404).json({ error: 'PDF no encontrado' });
            }

            const url = pdf.url_pdf;
            const publicId = extractCloudinaryPublicId(url);

            if (publicId) {
                try {
                    const result = await cloudinary.uploader.destroy(publicId, {
                        resource_type: 'raw',
                        invalidate: true,
                        type: 'upload'
                    });

                    if (result.result !== 'ok') {
                        const versionMatch = url.match(/\/upload\/(v\d+)\//);
                        if (versionMatch) {
                            const versionedId = `${versionMatch[1]}/${publicId}`;
                            await cloudinary.uploader.destroy(versionedId, { resource_type: 'raw' });
                        }
                    }
                } catch (cloudError) {
                    console.error('Error en Cloudinary:', cloudError.message);
                }
            }

            await pdf.destroy({ transaction: t });
            await t.commit();

            res.json({
                success: true,
                message: 'Registro eliminado de la base de datos',
                cloudinaryDeleted: publicId ? `Se intentó eliminar: ${publicId}` : 'No se pudo extraer public_id'
            });
        } catch (error) {
            await t.rollback();
            console.error('Error en el proceso:', error);
            res.status(500).json({
                error: 'Error al eliminar el registro',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
];

// Función para extraer public_id de Cloudinary
function extractCloudinaryPublicId(url) {
    try {
        if (!url) return null;
        const cloudinaryRegex = /\/upload\/(?:v\d+\/)?(.+?)\.pdf$/i;
        const matches = url.match(cloudinaryRegex);
        if (matches && matches[1]) return matches[1];
        const fileName = url.split('/').pop()?.split('.')[0];
        return fileName ? `pdf-operaciones/${fileName}` : null;
    } catch (error) {
        console.error('Error extrayendo public_id:', error);
        return null;
    }
}
