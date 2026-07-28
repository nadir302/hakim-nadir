import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

interface FileUploadProps {
  bucket?: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUpload({ bucket = 'avatars', currentUrl, onUploaded, accept = 'image/*', maxSizeMB = 5 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large (max ${maxSizeMB}MB)`);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/upload/${bucket}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded(res.data.url);
      toast.success('Uploaded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploaded('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {preview ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border">
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            <button type="button" onClick={handleRemove} className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground shadow"><X className="h-3 w-3" /></button>
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-dashed text-muted-foreground"><Upload className="h-6 w-6" /></div>
        )}
        <div className="flex flex-col gap-1.5">
          <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Upload className="mr-1 h-3 w-3" />}
            {uploading ? 'Uploading...' : currentUrl ? 'Change' : 'Upload'}
          </Button>
          <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP up to {maxSizeMB}MB</p>
        </div>
      </div>
    </div>
  );
}
