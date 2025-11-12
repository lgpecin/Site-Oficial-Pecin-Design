import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Clock } from 'lucide-react';
import { WeeklyCard } from '../WeeklyScheduleSection';

interface WeeklyCardItemProps {
  card: WeeklyCard;
  onDragStart: (card: WeeklyCard) => void;
  onDragEnd: () => void;
  onEdit: (card: WeeklyCard) => void;
  onDelete: (cardId: string) => void;
}

const WeeklyCardItem = ({ card, onDragStart, onDragEnd, onEdit, onDelete }: WeeklyCardItemProps) => {
  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <Card
      className="p-3 cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={() => onDragStart(card)}
      onDragEnd={onDragEnd}
      style={{ borderLeft: `4px solid ${card.color}` }}
    >
      <div className="space-y-2">
        {card.time && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="font-medium">{formatTime(card.time)}</span>
          </div>
        )}
        
        <h4 className="font-semibold text-sm line-clamp-2">{card.title}</h4>
        
        {card.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
        )}

        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-1 pt-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(card)}
            className="h-7 w-7 p-0"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(card.id)}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WeeklyCardItem;
