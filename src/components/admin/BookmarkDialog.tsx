import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: BookmarkFormData) => void;
  folders: { id: string; name: string; color: string }[];
  initialData?: BookmarkFormData;
}

export interface BookmarkFormData {
  title: string;
  url: string;
  description: string;
  folderId: string | null;
  icon: string;
  color: string;
  previewImage: string;
  tags: string[];
}

const BookmarkDialog = ({ open, onOpenChange, onSave, folders, initialData }: BookmarkDialogProps) => {
  const [formData, setFormData] = useState<BookmarkFormData>({
    title: '',
    url: '',
    description: '',
    folderId: null,
    icon: 'link',
    color: '#6366f1',
    previewImage: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [showCustomColor, setShowCustomColor] = useState(false);
  const { toast } = useToast();

  const presetColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#64748b',
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        url: '',
        description: '',
        folderId: null,
        icon: 'link',
        color: '#6366f1',
        previewImage: '',
        tags: [],
      });
    }
  }, [initialData, open]);

  const handleImportBookmarks = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.html';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const text = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = doc.querySelectorAll('a');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const bookmarks = Array.from(links).map(link => ({
          title: link.textContent || link.href,
          url: link.href,
          user_id: user.id,
          icon: 'link',
          color: presetColors[Math.floor(Math.random() * presetColors.length)],
        }));

        const { error } = await supabase.from('bookmarks').insert(bookmarks);
        if (error) throw error;

        toast({ title: `${bookmarks.length} bookmarks importados com sucesso!` });
        onOpenChange(false);
      };
      input.click();
    } catch (error: any) {
      toast({ title: 'Erro ao importar bookmarks', description: error.message, variant: 'destructive' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Link' : 'Adicionar Link'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nome do site ou recurso"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://exemplo.com"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do link..."
                rows={3}
              />
            </div>

            <div className="md:col-span-1">
              <Label htmlFor="folder">Pasta</Label>
              <Select
                value={formData.folderId || 'none'}
                onValueChange={(value) => setFormData({ ...formData, folderId: value === 'none' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pasta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem pasta</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: folder.color }}
                        />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1">
              <Label>Cor</Label>
              {!showCustomColor ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-8 gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-8 h-8 rounded-md border-2 transition-all",
                          formData.color === color ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomColor(true)}
                    className="w-full"
                  >
                    Personalizar
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomColor(false)}
                    className="w-full"
                  >
                    Voltar para Paleta
                  </Button>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="previewImage">URL da Imagem de Preview</Label>
              <Input
                id="previewImage"
                value={formData.previewImage}
                onChange={(e) => setFormData({ ...formData, previewImage: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Digite uma tag e pressione Enter"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {!initialData && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleImportBookmarks}
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                Importar Bookmarks
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 sm:flex-none">
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookmarkDialog;