import { Card } from '@/components/ui/card';
import WeeklyCardItem from './WeeklyCardItem';
import { WeeklyCard } from '../WeeklyScheduleSection';

interface WeeklyColumnProps {
  day: { id: number; title: string; color: string };
  cards: WeeklyCard[];
  onDragStart: (card: WeeklyCard) => void;
  onDragEnd: () => void;
  onDrop: (dayOfWeek: number) => void;
  onEditCard: (card: WeeklyCard) => void;
  onDeleteCard: (cardId: string) => void;
}

const WeeklyColumn = ({
  day,
  cards,
  onDragStart,
  onDragEnd,
  onDrop,
  onEditCard,
  onDeleteCard,
}: WeeklyColumnProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(day.id);
  };

  const sortedCards = [...cards].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  return (
    <div
      className="flex-shrink-0 w-64"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Card className="p-4 h-full min-h-[600px]">
        <div className="mb-4">
          <h3 className="font-semibold text-lg" style={{ color: day.color }}>
            {day.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
        <div className="space-y-3">
          {sortedCards.map((card) => (
            <WeeklyCardItem
              key={card.id}
              card={card}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WeeklyColumn;
