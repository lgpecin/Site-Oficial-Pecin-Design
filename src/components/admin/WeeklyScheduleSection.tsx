import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import WeeklyBoard from './weekly/WeeklyBoard';
import WeeklyCardDialog from './weekly/WeeklyCardDialog';

export interface WeeklyCard {
  id: string;
  title: string;
  description: string | null;
  day_of_week: number;
  time: string | null;
  color: string;
  tags: string[];
  display_order: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const WeeklyScheduleSection = () => {
  const [cards, setCards] = useState<WeeklyCard[]>([]);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<WeeklyCard | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);

  const loadCards = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_schedule_cards')
        .select('*')
        .order('time', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error loading cards:', error);
      toast.error('Erro ao carregar cards');
    }
  };

  const handleEditCard = (card: WeeklyCard) => {
    setEditingCard(card);
    setShowCardDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCardDialog(false);
    setEditingCard(null);
    loadCards();
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('weekly_schedule_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      toast.success('Card excluído!');
      loadCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Erro ao excluir card');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Agenda Semanal</h2>
          <p className="text-sm text-muted-foreground mt-1">Organize sua agenda por dia da semana</p>
        </div>
        <Button onClick={() => setShowCardDialog(true)} className="flex-1 sm:flex-none">
          <Plus className="h-4 w-4 mr-2" />
          Novo Card
        </Button>
      </div>

      <WeeklyBoard
        cards={cards}
        onEditCard={handleEditCard}
        onDeleteCard={handleDeleteCard}
        onReloadCards={loadCards}
      />

      <WeeklyCardDialog
        open={showCardDialog}
        card={editingCard}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default WeeklyScheduleSection;
