import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware';
import { uploadToSupabase, deleteFromSupabase } from '../middleware/upload.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/:bucket?', authenticate, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No file provided', 400);
    const bucket = (req.params.bucket || 'avatars').replace(/[^a-z0-9_-]/g, '');
    const result = await uploadToSupabase({ buffer: req.file.buffer, originalname: req.file.originalname, mimetype: req.file.mimetype }, bucket);
    res.json(result);
  } catch (error) { next(error); }
});

router.delete('/:bucket/:fileName', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bucket = req.params.bucket.replace(/[^a-z0-9_-]/g, '');
    await deleteFromSupabase(req.params.fileName, bucket);
    res.json({ message: 'File deleted' });
  } catch (error) { next(error); }
});

export default router;
