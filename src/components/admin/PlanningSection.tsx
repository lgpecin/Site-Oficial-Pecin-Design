import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlanningItem {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
}

const PlanningSection = () => {
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('planning_items')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Erro ao carregar planejamento');
    }
  };

  const createItem = async () => {
    if (!formData.title.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('planning_items')
        .insert({
          title: formData.title,
          description: formData.description || null,
          due_date: formData.due_date || null,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success('Item criado!');
      setFormData({ title: '', description: '', due_date: '' });
      setShowForm(false);
      loadItems();
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Erro ao criar item');
    }
  };

  const updateStatus = async (itemId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('planning_items')
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Status atualizado!');
      loadItems();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('planning_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Item excluído!');
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      in_progress: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
      completed: 'bg-green-500/20 text-green-700 dark:text-green-300',
    };
    const labels = {
      pending: 'Pendente',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
    };
    return { style: styles[status as keyof typeof styles], label: labels[status as keyof typeof labels] };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Planejamento</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {showForm && (
        <div className="p-6 border rounded-lg bg-card space-y-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título da tarefa"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição (opcional)"
            className="w-full px-4 py-2 border rounded-lg min-h-[100px]"
          />
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <div className="flex gap-2">
            <Button onClick={createItem}>Criar</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Nenhuma tarefa criada</p>
          </div>
        ) : (
          items.map((item) => {
            const statusInfo = getStatusBadge(item.status);
            return (
              <div key={item.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const nextStatus = item.status === 'pending' ? 'in_progress' :
                                         item.status === 'in_progress' ? 'completed' : 'pending';
                        updateStatus(item.id, nextStatus);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-1 rounded-full font-medium ${statusInfo.style}`}>
                    {statusInfo.label}
                  </span>
                  {item.due_date && (
                    <span className="text-muted-foreground">
                      Prazo: {format(new Date(item.due_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlanningSection;