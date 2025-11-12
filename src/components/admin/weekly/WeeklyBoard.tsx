import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import WeeklyColumn from './WeeklyColumn';
import { WeeklyCard } from '../WeeklyScheduleSection';

interface WeeklyBoardProps {
  cards: WeeklyCard[];
  onEditCard: (card: WeeklyCard) => void;
  onDeleteCard: (cardId: string) => void;
  onReloadCards: () => void;
}

const daysOfWeek = [
  { id: 0, title: 'Segunda', color: 'hsl(var(--primary))' },
  { id: 1, title: 'Terça', color: 'hsl(var(--accent))' },
  { id: 2, title: 'Quarta', color: 'hsl(var(--secondary))' },
  { id: 3, title: 'Quinta', color: 'hsl(var(--muted))' },
  { id: 4, title: 'Sexta', color: 'hsl(var(--primary))' },
  { id: 5, title: 'Sábado', color: 'hsl(var(--accent))' },
  { id: 6, title: 'Domingo', color: 'hsl(var(--secondary))' },
];

const WeeklyBoard = ({ cards, onEditCard, onDeleteCard, onReloadCards }: WeeklyBoardProps) => {
  const [draggedCard, setDraggedCard] = useState<WeeklyCard | null>(null);

  const handleDragStart = (card: WeeklyCard) => {
    setDraggedCard(card);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const handleDrop = async (dayOfWeek: number) => {
    if (!draggedCard) return;

    try {
      const { error } = await supabase
        .from('weekly_schedule_cards')
        .update({ day_of_week: dayOfWeek })
        .eq('id', draggedCard.id);

      if (error) throw error;

      toast.success('Dia da semana atualizado!');
      onReloadCards();
    } catch (error) {
      console.error('Error updating card day:', error);
      toast.error('Erro ao atualizar dia');
    } finally {
      setDraggedCard(null);
    }
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {daysOfWeek.map((day) => (
          <WeeklyColumn
            key={day.id}
            day={day}
            cards={cards.filter((card) => card.day_of_week === day.id)}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
          />
        ))}
      </div>
    </div>
  );
};

export default WeeklyBoard;
