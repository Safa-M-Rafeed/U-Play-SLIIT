import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- PATH SETUP ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This ensures we go up from src/middleware to the Backend root 'uploads' folder
const absoluteUploadPath = path.resolve(__dirname, '../../uploads');

// Ensure the directory exists immediately
if (!fs.existsSync(absoluteUploadPath)) {
    fs.mkdirSync(absoluteUploadPath, { recursive: true });
}

// --- SHARED CONFIG ---
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB limit

// --- MATCH PHOTOS CONFIG ---
const matchStorageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, absoluteUploadPath); //
    },
    filename: (req, file, cb) => {
        // Sanitize filename to prevent issues with spaces/special chars
        const safeName = file.originalname.replace(/\s+/g, '-');
        cb(null, `${Date.now()}-${safeName}`); //
    }
});

export const uploadMatchPhotos = multer({ 
    storage: matchStorageConfig,
    fileFilter,
    limits 
});

// --- AVATAR CONFIG ---
const avatarStorageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, absoluteUploadPath); 
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const userId = req.user?._id || 'guest';
        cb(null, `avatar-${userId}-${Date.now()}${extension}`); //
    }
});

export const uploadAvatar = multer({
    storage: avatarStorageConfig,
    fileFilter,
    limits
});