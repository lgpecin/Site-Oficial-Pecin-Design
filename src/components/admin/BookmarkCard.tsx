import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Trash2, Edit, GripVertical, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookmarkCardProps {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon: string;
  color: string;
  previewImage?: string;
  isActive: boolean;
  tags: string[];
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const BookmarkCard = ({
  title,
  url,
  description,
  color,
  previewImage,
  isActive,
  tags,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
}: BookmarkCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Card
      className="group cursor-move hover:shadow-lg transition-all duration-200"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <CardContent className="p-0">
        {/* Preview Image */}
        <div 
          className="h-40 relative overflow-hidden rounded-t-lg"
          style={{ backgroundColor: imageError || !previewImage ? color : 'transparent' }}
        >
          {previewImage && !imageError ? (
            <img
              src={previewImage}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ExternalLink className="h-12 w-12 text-white/50" />
            </div>
          )}
          
          {/* Drag Handle */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-5 w-5 text-white drop-shadow-lg" />
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant={isActive ? "default" : "destructive"} className="gap-1">
              {isActive ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Ativo
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Inativo
                </>
              )}
            </Badge>
          </div>

          {/* Actions Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Abrir
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
          
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary line-clamp-1 mb-2 block"
          >
            {url}
          </a>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookmarkCard;