import { v4 as uuid } from 'uuid';
import { supabase } from '../config/supabase';

interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export async function uploadToSupabase(file: UploadFile, bucket: string = 'avatars') {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error('Only image files are allowed (jpeg, png, gif, webp, svg)');
  }

  const ext = file.originalname.split('.').pop() || 'jpg';
  const fileName = `${uuid()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer || (file as any).buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return { url: publicUrl, fileName };
}

export async function deleteFromSupabase(fileName: string, bucket: string = 'avatars') {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) throw new Error(error.message);
}
