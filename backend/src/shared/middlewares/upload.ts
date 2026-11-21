import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { AppError } from '../errors/AppError';

export const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

export const productImageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(
        new AppError(
          'Formato de imagem inválido. Utilize JPG, PNG, WEBP ou GIF.',
          400,
          { image: 'Formato de imagem inválido. Utilize JPG, PNG, WEBP ou GIF.' }
        )
      );
      return;
    }
    cb(null, true);
  },
});

export function removeUploadedFile(imageUrl: string | null | undefined): void {
  if (!imageUrl) return;
  const filename = path.basename(imageUrl);
  const fullPath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, () => {
      // Ignore cleanup errors
    });
  }
}

