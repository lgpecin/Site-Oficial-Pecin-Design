import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  banner_image: string | null;
  year: number;
  display_order: number;
}

interface ProjectListProps {
  onEdit: (projectId: string) => void;
  refresh: number;
}

const ProjectList = ({ onEdit, refresh }: ProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, [refresh]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error loading projects:', error);
      toast({
        title: 'Erro ao carregar projetos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Projeto excluído com sucesso!',
      });

      loadProjects();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting project:', error);
      toast({
        title: 'Erro ao excluir projeto',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedItem(projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = projects.findIndex(p => p.id === draggedItem);
    const targetIndex = projects.findIndex(p => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newProjects = [...projects];
    const [removed] = newProjects.splice(draggedIndex, 1);
    newProjects.splice(targetIndex, 0, removed);

    setProjects(newProjects);
    setDraggedItem(null);

    try {
      const updates = newProjects.map((project, index) => 
        supabase
          .from('projects')
          .update({ display_order: index })
          .eq('id', project.id)
      );

      await Promise.all(updates);

      toast({
        title: 'Ordem atualizada com sucesso!',
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating order:', error);
      toast({
        title: 'Erro ao atualizar ordem',
        variant: 'destructive',
      });
      loadProjects();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando projetos...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum projeto cadastrado ainda.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="overflow-hidden cursor-move hover:shadow-lg transition-shadow"
            draggable
            onDragStart={(e) => handleDragStart(e, project.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, project.id)}
          >
            <div className="relative">
              {project.banner_image && (
                <img
                  src={project.banner_image}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="absolute top-2 left-2 bg-background/80 rounded p-1 cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <CardContent className="p-4">
              <div className="mb-2">
                <span className="text-xs text-primary">{project.category}</span>
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
                <span className="text-xs text-muted-foreground">{project.year}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(project.id)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteId(project.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectList;
