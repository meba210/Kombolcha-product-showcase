import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary';

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || 'kombolcha_showcase_jwt_secret_2026';

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'kombolcha-factory',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    resource_type: 'image',
  } as any),
});

const upload = multer({
  storage: storage as unknown as multer.StorageEngine,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

interface AuthRequest extends Request {
  admin?: {
    id: number;
    role: string;
  };
}

// Verify Admin JWT
function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET) as {
      id: number;
      role: string;
    };

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

// Upload Image
router.post(
  '/',
  requireAdmin,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const file = req.file as Express.Multer.File & {
        path?: string;
        secure_url?: string;
        url?: string;
        filename?: string;
        public_id?: string;
      };

      const imageUrl = file.secure_url || file.path || file.url;

      if (!imageUrl) {
        return res.status(500).json({
          success: false,
          message: 'Cloudinary upload did not return a usable URL',
        });
      }

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        url: imageUrl,
        public_id: file.public_id || file.filename,
      });
    } catch (err: any) {
      console.error('Upload error:', err);

      res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

// Delete Image
router.delete(
  '/:publicId',
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Public ID is required',
        });
      }

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'not found') {
        return res.status(404).json({
          success: false,
          message: 'Image not found on Cloudinary',
        });
      }

      res.json({
        success: true,
        message: 'Image deleted successfully',
        result: result.result,
      });
    } catch (err: any) {
      console.error('Delete error:', err);

      res.status(500).json({
        success: false,
        message: 'Delete failed',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

export default router;

