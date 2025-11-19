import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, Crop } from 'lucide-react';

interface BannerUploadWithCropProps {
  currentBanner: string;
  onBannerChange: (url: string) => void;
  onImageSelected: (url: string) => void;
}

const BannerUploadWithCrop = ({ currentBanner, onBannerChange, onImageSelected }: BannerUploadWithCropProps) => {
  const [preview, setPreview] = useState(currentBanner);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(currentBanner);
  }, [currentBanner]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setPreview(imageUrl);
      onImageSelected(imageUrl);
      setUploading(false);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const clearPreview = () => {
    setPreview('');
    onBannerChange('');
  };

  const handleRecrop = () => {
    if (preview) {
      onImageSelected(preview);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Imagem Banner</Label>
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Banner preview" className="w-full h-48 object-cover rounded-md" />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleRecrop}
            >
              <Crop className="h-4 w-4 mr-1" />
              Recortar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={clearPreview}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="banner-upload"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {uploading ? 'Carregando...' : 'Clique para selecionar imagem'}
          </span>
        </label>
      )}
      <input
        id="banner-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default BannerUploadWithCrop;
