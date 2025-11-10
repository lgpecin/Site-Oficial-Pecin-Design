import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';
import { X } from 'lucide-react';

interface ProjectFormProps {
  projectId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm = ({ projectId, onSuccess, onCancel }: ProjectFormProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [bannerImage, setBannerImage] = useState('');
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>(['']);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (image_url, display_order),
          project_technologies (technology)
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;

      setTitle(project.title);
      setCategory(project.category);
      setDescription(project.description);
      setFullDescription(project.full_description);
      setYear(project.year);
      setBannerImage(project.banner_image || '');
      
      const images = project.project_images
        ?.sort((a, b) => a.display_order - b.display_order)
        .map(img => img.image_url) || [];
      setDetailImages(images);
      
      const techs = project.project_technologies?.map(t => t.technology) || [''];
      setTechnologies(techs.length > 0 ? techs : ['']);
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Erro ao carregar projeto',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectData = {
        title,
        category,
        description,
        full_description: fullDescription,
        year,
        banner_image: bannerImage,
      };

      let finalProjectId = projectId;

      if (projectId) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId);

        if (error) throw error;

        // Delete old images and technologies
        await supabase.from('project_images').delete().eq('project_id', projectId);
        await supabase.from('project_technologies').delete().eq('project_id', projectId);
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert(projectData)
          .select()
          .single();

        if (error) throw error;
        finalProjectId = data.id;
      }

      // Insert images
      if (detailImages.length > 0) {
        const imageInserts = detailImages.map((url, index) => ({
          project_id: finalProjectId,
          image_url: url,
          display_order: index,
        }));

        const { error: imagesError } = await supabase
          .from('project_images')
          .insert(imageInserts);

        if (imagesError) throw imagesError;
      }

      // Insert technologies
      const validTechs = technologies.filter(t => t.trim() !== '');
      if (validTechs.length > 0) {
        const techInserts = validTechs.map(tech => ({
          project_id: finalProjectId,
          technology: tech,
        }));

        const { error: techError } = await supabase
          .from('project_technologies')
          .insert(techInserts);

        if (techError) throw techError;
      }

      toast({
        title: projectId ? 'Projeto atualizado!' : 'Projeto criado!',
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Erro ao salvar projeto',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addTechnology = () => {
    setTechnologies([...technologies, '']);
  };

  const removeTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  const updateTechnology = (index: number, value: string) => {
    const newTechs = [...technologies];
    newTechs[index] = value;
    setTechnologies(newTechs);
  };

  const addDetailImage = (url: string) => {
    setDetailImages([...detailImages, url]);
  };

  const removeDetailImage = (index: number) => {
    setDetailImages(detailImages.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{projectId ? 'Editar Projeto' : 'Novo Projeto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Curta</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullDescription">Descrição Completa</Label>
            <Textarea
              id="fullDescription"
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Ano</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              required
            />
          </div>

          <ImageUpload
            label="Imagem Banner"
            currentImage={bannerImage}
            onImageUploaded={setBannerImage}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Imagens de Detalhes</Label>
              <Button type="button" size="sm" onClick={() => addDetailImage('')}>
                Adicionar Imagem
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {detailImages.map((url, index) => (
                <div key={index} className="relative">
                  {url ? (
                    <>
                      <img
                        src={url}
                        alt={`Detail ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeDetailImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <ImageUpload
                      label={`Detalhe ${index + 1}`}
                      onImageUploaded={(newUrl) => {
                        const newImages = [...detailImages];
                        newImages[index] = newUrl;
                        setDetailImages(newImages);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tecnologias/Softwares</Label>
              <Button type="button" size="sm" onClick={addTechnology}>
                Adicionar
              </Button>
            </div>
            {technologies.map((tech, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={tech}
                  onChange={(e) => updateTechnology(index, e.target.value)}
                  placeholder="Ex: Photoshop, After Effects"
                />
                {technologies.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeTechnology(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Projeto'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
