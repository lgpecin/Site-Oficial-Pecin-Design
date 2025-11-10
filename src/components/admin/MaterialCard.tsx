import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MaterialCardProps {
  material: {
    id: string;
    title: string;
    type: string;
    description: string | null;
    status: string;
    post_date: string | null;
  };
  onEdit: (id: string) => void;
  onDelete: () => void;
}

const MaterialCard = ({ material, onEdit, onDelete }: MaterialCardProps) => {
  const [showDelete, setShowDelete] = useState(false);
  const [fileCount, setFileCount] = useState({ images: 0, videos: 0 });
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, [material.id]);

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from('material_files')
      .select('file_type, file_path')
      .eq('material_id', material.id);

    if (!error && data) {
      const images = data.filter((f) => f.file_type === 'image').length;
      const videos = data.filter((f) => f.file_type === 'video').length;
      setFileCount({ images, videos });

      // Carregar thumbnail da primeira imagem
      const firstImage = data.find((f) => f.file_type === 'image');
      if (firstImage) {
        const { data: urlData } = supabase.storage
          .from('client-materials')
          .getPublicUrl(firstImage.file_path);
        setThumbnail(urlData.publicUrl);
      }
    }
  };

  const handleDelete = async () => {
    // Deletar arquivos do storage
    const { data: files } = await supabase
      .from('material_files')
      .select('file_path')
      .eq('material_id', material.id);

    if (files) {
      const filePaths = files.map((f) => f.file_path);
      await supabase.storage.from('client-materials').remove(filePaths);
    }

    // Deletar material (cascade vai deletar material_files e approvals)
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', material.id);

    if (error) {
      toast({ title: 'Erro ao excluir material', variant: 'destructive' });
    } else {
      toast({ title: 'Material excluído com sucesso!' });
      onDelete();
    }
    setShowDelete(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pronto': 'bg-green-500',
      'Em Processo': 'bg-blue-500',
      'Ideia': 'bg-purple-500',
      'Planejamento': 'bg-yellow-500',
      'Cancelado': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          {thumbnail ? (
            <img src={thumbnail} alt={material.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="secondary">{material.type}</Badge>
          </div>
        </div>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{material.title}</h3>
              <Badge className={getStatusColor(material.status)}>
                {material.status}
              </Badge>
            </div>
            
            {material.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {material.description}
              </p>
            )}

            {material.post_date && (
              <p className="text-xs text-muted-foreground">
                Data: {new Date(material.post_date).toLocaleDateString('pt-BR')}
              </p>
            )}

            <div className="flex gap-2 text-xs text-muted-foreground">
              {fileCount.images > 0 && (
                <span className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  {fileCount.images}
                </span>
              )}
              {fileCount.videos > 0 && (
                <span className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  {fileCount.videos}
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(material.id)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este material? Todos os arquivos e aprovações
              serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MaterialCard;
