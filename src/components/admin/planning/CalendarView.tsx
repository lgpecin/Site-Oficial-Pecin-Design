import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { KanbanCard } from '../PlanningSection';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarViewProps {
  cards: KanbanCard[];
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (cardId: string) => void;
}

const CalendarView = ({ cards, onEditCard }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getCardsForDay = (day: Date) => {
    return cards.filter(
      (card) => card.due_date && isSameDay(new Date(card.due_date), day)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dayCards = getCardsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border rounded-lg ${
                isCurrentMonth ? 'bg-card' : 'bg-muted/20'
              } ${isToday ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
              <div className="space-y-1">
                {dayCards.map((card) => (
                  <div
                    key={card.id}
                    className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: `${card.color}40`, borderLeft: `3px solid ${card.color}` }}
                    onClick={() => onEditCard(card)}
                  >
                    <div className="font-medium truncate">{card.title}</div>
                    {card.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {card.tags.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
