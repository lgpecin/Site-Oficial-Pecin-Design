import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  label?: string;
  currentImage?: string;
}

const ImageUpload = ({ onImageUploaded, label = 'Imagem', currentImage }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      // Comprimir imagem automaticamente
      toast({
        title: 'Comprimindo imagem...',
        description: 'Otimizando para carregamento rápido',
      });
      
      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.92,
        convertToWebP: true
      });

      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('project-images')
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onImageUploaded(publicUrl);

      toast({
        title: 'Imagem enviada com sucesso!',
        description: 'Imagem comprimida e otimizada',
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error uploading image:', error);
      toast({
        title: 'Erro ao enviar imagem',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    onImageUploaded('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-md"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-md p-4">
          <Label htmlFor={`image-upload-${label}`} className="cursor-pointer">
            <div className="flex flex-col items-center justify-center gap-2">
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <span className="text-sm text-primary font-medium">
                    Comprimindo e enviando...
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Clique para selecionar imagem
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Compressão automática ativada
                  </span>
                </>
              )}
            </div>
          </Label>
          <Input
            id={`image-upload-${label}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
