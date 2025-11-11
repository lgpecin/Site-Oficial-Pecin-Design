import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import KanbanCardItem from './KanbanCardItem';
import { KanbanCard } from '../PlanningSection';

interface Column {
  id: string;
  title: string;
  color: string;
}

interface KanbanColumnProps {
  column: Column;
  cards: KanbanCard[];
  onDragStart: (card: KanbanCard) => void;
  onDragEnd: () => void;
  onDrop: (status: string) => void;
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (cardId: string) => void;
}

const KanbanColumn = ({
  column,
  cards,
  onDragStart,
  onDragEnd,
  onDrop,
  onEditCard,
  onDeleteCard,
}: KanbanColumnProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(column.id);
  };

  return (
    <div
      className={`flex flex-col p-4 rounded-lg border-2 transition-colors ${
        isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-card'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{column.title}</h3>
        <Badge variant="secondary">{cards.length}</Badge>
      </div>
      <div className="space-y-3 flex-1">
        {cards.map((card) => (
          <KanbanCardItem
            key={card.id}
            card={card}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
          />
        ))}
        {cards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
            Nenhum card
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
