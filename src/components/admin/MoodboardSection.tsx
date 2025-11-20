import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import MoodboardCanvas from './MoodboardCanvas';

interface MoodboardPage {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

const MoodboardSection = () => {
  const [pages, setPages] = useState<MoodboardPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      loadPages();
    }
  }, [user]);

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('moodboard_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Erro ao carregar páginas');
    }
  };

  const createPage = async () => {
    if (!newPageName.trim()) {
      toast.error('Digite um nome para a página');
      return;
    }
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('moodboard_pages')
        .insert({
          name: newPageName,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Página criada!');
      setPages([data, ...pages]);
      setNewPageName('');
      setSelectedPage(data.id);
    } catch (error: any) {
      console.error('Error creating page:', error);
      toast.error(error.message || 'Erro ao criar página');
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from('moodboard_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      toast.success('Página excluída!');
      setPages(pages.filter(p => p.id !== pageId));
      if (selectedPage === pageId) {
        setSelectedPage(null);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Erro ao excluir página');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Moodboard</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            placeholder="Nome da página"
            className="px-4 py-2 border rounded-lg w-full sm:w-auto"
            onKeyPress={(e) => e.key === 'Enter' && createPage()}
          />
          <Button onClick={createPage} disabled={!newPageName.trim() || loading || !user} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Carregando...' : 'Nova Página'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pages list */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-4">Páginas</h3>
          {pages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma página criada</p>
          ) : (
            pages.map((page) => (
              <div
                key={page.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPage === page.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedPage(page.id)}
              >
                <span className="font-medium">{page.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePage(page.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          {selectedPage ? (
            <MoodboardCanvas pageId={selectedPage} />
          ) : (
            <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-lg bg-muted/20">
              <p className="text-muted-foreground">Selecione ou crie uma página para começar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodboardSection;