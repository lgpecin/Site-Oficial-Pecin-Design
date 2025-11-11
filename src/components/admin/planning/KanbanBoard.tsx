import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import KanbanColumn from './KanbanColumn';
import { KanbanCard } from '../PlanningSection';

interface KanbanBoardProps {
  cards: KanbanCard[];
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (cardId: string) => void;
  onReloadCards: () => void;
}

const columns = [
  { id: 'todo', title: 'A Fazer', color: 'hsl(var(--muted))' },
  { id: 'in_progress', title: 'Em Progresso', color: 'hsl(var(--primary))' },
  { id: 'review', title: 'Revisão', color: 'hsl(var(--accent))' },
  { id: 'done', title: 'Concluído', color: 'hsl(var(--success))' },
];

const KanbanBoard = ({ cards, onEditCard, onDeleteCard, onReloadCards }: KanbanBoardProps) => {
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);

  const handleDragStart = (card: KanbanCard) => {
    setDraggedCard(card);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const handleDrop = async (status: string) => {
    if (!draggedCard) return;

    try {
      const { error } = await supabase
        .from('kanban_cards')
        .update({ status })
        .eq('id', draggedCard.id);

      if (error) throw error;

      toast.success('Status atualizado!');
      onReloadCards();
    } catch (error) {
      console.error('Error updating card status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setDraggedCard(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          cards={cards.filter((card) => card.status === column.id)}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onEditCard={onEditCard}
          onDeleteCard={onDeleteCard}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
