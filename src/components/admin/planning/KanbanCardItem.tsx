import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pencil, Trash2, Calendar, Paperclip, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { KanbanCard, ChecklistItem, Attachment } from '../PlanningSection';

interface KanbanCardItemProps {
  card: KanbanCard;
  onDragStart: (card: KanbanCard) => void;
  onDragEnd: () => void;
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (cardId: string) => void;
}

const KanbanCardItem = ({
  card,
  onDragStart,
  onDragEnd,
  onEditCard,
  onDeleteCard,
}: KanbanCardItemProps) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    loadChecklistAndAttachments();
  }, [card.id]);

  const loadChecklistAndAttachments = async () => {
    try {
      const [checklistRes, attachmentsRes] = await Promise.all([
        supabase
          .from('kanban_checklist_items')
          .select('*')
          .eq('card_id', card.id)
          .order('display_order'),
        supabase
          .from('kanban_attachments')
          .select('*')
          .eq('card_id', card.id),
      ]);

      if (checklistRes.data) setChecklistItems(checklistRes.data);
      if (attachmentsRes.data) setAttachments(attachmentsRes.data);
    } catch (error) {
      console.error('Error loading card details:', error);
    }
  };

  const completedItems = checklistItems.filter((item) => item.completed).length;
  const totalItems = checklistItems.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(card)}
      onDragEnd={onDragEnd}
      className="p-4 rounded-lg border bg-card hover:shadow-md transition-all cursor-move"
      style={{ borderLeftWidth: '4px', borderLeftColor: card.color }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-medium line-clamp-2">{card.title}</h4>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditCard(card);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCard(card.id);
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>

        {((card as any).client_name || (card as any).client_icon) && (
          <div className="flex items-center gap-2 text-sm">
            {(card as any).client_icon && (
              <span className="text-lg">{(card as any).client_icon}</span>
            )}
            {(card as any).client_name && (
              <span className="text-muted-foreground">{(card as any).client_name}</span>
            )}
          </div>
        )}

        {card.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p>
        )}

        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {totalItems > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckSquare className="h-3 w-3" />
              <span>
                {completedItems}/{totalItems}
              </span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {card.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(card.due_date), 'dd/MM', { locale: ptBR })}</span>
            </div>
          )}
          {attachments.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>{attachments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanCardItem;
