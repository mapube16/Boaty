import express from 'express';
import cloudinary from '../config/cloudinary.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// POST /api/uploads — Upload images to Cloudinary
router.post('/', upload.array('fotos', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se enviaron imágenes.',
            });
        }

        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'boaty/embarcaciones',
                        transformation: [
                            { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
                        ],
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                        });
                    },
                );
                stream.end(file.buffer);
            });
        });

        const uploaded = await Promise.all(uploadPromises);

        return res.status(200).json({
            success: true,
            fotos: uploaded,
        });
    } catch (error) {
        console.error('Error al subir imágenes a Cloudinary:', error);

        if (error.message?.includes('Solo se permiten')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Error al subir las imágenes. Intenta de nuevo.',
        });
    }
});

export default router;
