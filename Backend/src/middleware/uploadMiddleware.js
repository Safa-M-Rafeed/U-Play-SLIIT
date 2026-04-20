import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This ensures we go up from src/middleware to the Backend root
const uploadPath = path.join(__dirname, '../../uploads');

// Helper to ensure upload directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const matchStorageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const uploadMatchPhotos = multer({ 
  storage: matchStorageConfig,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Storage for Avatars (Optional keep)
const avatarStorageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const userId = req.user?._id || 'guest';
    cb(null, `avatar-${userId}-${Date.now()}${extension}`);
  }
});

export const uploadAvatar = multer({
  storage: avatarStorageConfig,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});