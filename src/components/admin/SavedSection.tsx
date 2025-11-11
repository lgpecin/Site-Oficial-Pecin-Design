import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SavedItem {
  id: string;
  item_type: string;
  item_id: string;
  created_at: string;
  item_data?: any;
}

const SavedSection = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSavedItems();
    }
  }, [user]);

  const loadSavedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load additional data for each item
      const itemsWithData = await Promise.all(
        (data || []).map(async (item) => {
          let itemData = null;
          try {
            const { data: itemDetails } = await supabase
              .from(item.item_type === 'project' ? 'projects' : 
                    item.item_type === 'material' ? 'materials' :
                    item.item_type === 'service' ? 'services' : 'clients')
              .select('*')
              .eq('id', item.item_id)
              .single();
            itemData = itemDetails;
          } catch (e) {
            console.error('Error loading item details:', e);
          }
          return { ...item, item_data: itemData };
        })
      );

      setSavedItems(itemsWithData);
    } catch (error) {
      console.error('Error loading saved items:', error);
      toast.error('Erro ao carregar salvos');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Item removido dos salvos');
      setSavedItems(savedItems.filter(i => i.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Erro ao remover item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Salvos</h2>
        <p className="text-muted-foreground">{savedItems.length} itens salvos</p>
      </div>

      {savedItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Nenhum item salvo ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase">
                    {item.item_type}
                  </span>
                  <h3 className="font-semibold mt-1">
                    {item.item_data?.title || item.item_data?.name || 'Item'}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              {item.item_data?.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {item.item_data.description}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground">
                Salvo em {new Date(item.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSection;