import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, List, LayoutGrid } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import KanbanBoard from './planning/KanbanBoard';
import CalendarView from './planning/CalendarView';
import ListView from './planning/ListView';
import CardDialog from './planning/CardDialog';

export interface KanbanCard {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  color: string;
  tags: string[];
  status: string;
  display_order: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  card_id: string;
  title: string;
  completed: boolean;
  display_order: number;
  created_at: string;
}

export interface Attachment {
  id: string;
  card_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

type ViewMode = 'kanban' | 'calendar' | 'list';

const PlanningSection = () => {
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);

  const loadCards = async () => {
    try {
      const { data, error } = await supabase
        .from('kanban_cards')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error loading cards:', error);
      toast.error('Erro ao carregar cards');
    }
  };

  const handleEditCard = (card: KanbanCard) => {
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
        .from('kanban_cards')
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
        <h2 className="text-2xl sm:text-3xl font-bold">Planejamento</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowCardDialog(true)} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Novo Card
          </Button>
        </div>
      </div>

      {viewMode === 'kanban' && (
        <KanbanBoard
          cards={cards}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          onReloadCards={loadCards}
        />
      )}

      {viewMode === 'calendar' && (
        <CalendarView
          cards={cards}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
        />
      )}

      {viewMode === 'list' && (
        <ListView
          cards={cards}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
        />
      )}

      <CardDialog
        open={showCardDialog}
        card={editingCard}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default PlanningSection;
