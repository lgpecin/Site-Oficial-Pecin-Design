import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { X, Plus, Check, Trash2, Upload, Download } from 'lucide-react';
import { KanbanCard, ChecklistItem, Attachment } from '../PlanningSection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CardDialogProps {
  open: boolean;
  card: KanbanCard | null;
  onClose: () => void;
}

const presetColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
  '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
];

const CardDialog = ({ open, card, onClose }: CardDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    color: '#6366f1',
    status: 'todo',
    client_name: '',
    client_icon: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistInput, setChecklistInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title,
        description: card.description || '',
        due_date: card.due_date || '',
        color: card.color,
        status: card.status,
        client_name: (card as any).client_name || '',
        client_icon: (card as any).client_icon || '',
      });
      setTags(card.tags || []);
      loadChecklistAndAttachments(card.id);
    } else {
      resetForm();
    }
  }, [card]);

  const loadChecklistAndAttachments = async (cardId: string) => {
    try {
      const [checklistRes, attachmentsRes] = await Promise.all([
        supabase
          .from('kanban_checklist_items')
          .select('*')
          .eq('card_id', cardId)
          .order('display_order'),
        supabase
          .from('kanban_attachments')
          .select('*')
          .eq('card_id', cardId),
      ]);

      if (checklistRes.data) setChecklist(checklistRes.data);
      if (attachmentsRes.data) setAttachments(attachmentsRes.data);
    } catch (error) {
      console.error('Error loading checklist and attachments:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      color: '#6366f1',
      status: 'todo',
      client_name: '',
      client_icon: '',
    });
    setTags([]);
    setTagInput('');
    setChecklist([]);
    setChecklistInput('');
    setAttachments([]);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !user) return;

    setLoading(true);
    try {
      if (card) {
        const { error } = await supabase
          .from('kanban_cards')
          .update({
            ...formData,
            tags,
          })
          .eq('id', card.id);

        if (error) throw error;
        toast.success('Card atualizado!');
      } else {
        const { data, error } = await supabase
          .from('kanban_cards')
          .insert({
            ...formData,
            tags,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        toast.success('Card criado!');
      }

      onClose();
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error('Erro ao salvar card');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addChecklistItem = async () => {
    if (!checklistInput.trim() || !card) return;

    try {
      const { data, error } = await supabase
        .from('kanban_checklist_items')
        .insert({
          card_id: card.id,
          title: checklistInput.trim(),
          display_order: checklist.length,
        })
        .select()
        .single();

      if (error) throw error;
      setChecklist([...checklist, data]);
      setChecklistInput('');
      toast.success('Item adicionado!');
    } catch (error) {
      console.error('Error adding checklist item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  const toggleChecklistItem = async (item: ChecklistItem) => {
    try {
      const { error } = await supabase
        .from('kanban_checklist_items')
        .update({ completed: !item.completed })
        .eq('id', item.id);

      if (error) throw error;
      setChecklist(
        checklist.map((i) =>
          i.id === item.id ? { ...i, completed: !i.completed } : i
        )
      );
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const deleteChecklistItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('kanban_checklist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setChecklist(checklist.filter((i) => i.id !== itemId));
      toast.success('Item removido!');
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      toast.error('Erro ao remover item');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !card) return;

    const file = e.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${card.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('client-materials')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('kanban_attachments')
        .insert({
          card_id: card.id,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      setAttachments([...attachments, data]);
      toast.success('Arquivo enviado!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachment: Attachment) => {
    try {
      const { error } = await supabase
        .from('kanban_attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) throw error;
      setAttachments(attachments.filter((a) => a.id !== attachment.id));
      toast.success('Arquivo removido!');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Erro ao remover arquivo');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{card ? 'Editar Card' : 'Novo Card'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nome do card"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes do card"
              rows={3}
            />
          </div>

          <div>
            <Label>DESTINO (Cliente)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_name">Nome do Cliente</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <Label htmlFor="client_icon">Ícone (emoji ou texto)</Label>
                <Input
                  id="client_icon"
                  value={formData.client_icon}
                  onChange={(e) => setFormData({ ...formData, client_icon: e.target.value })}
                  placeholder="🎯"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due_date">Data</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">A Fazer</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-foreground' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Adicionar tag"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {card && (
            <>
              <div>
                <Label>Checklist</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={checklistInput}
                    onChange={(e) => setChecklistInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addChecklistItem())
                    }
                    placeholder="Adicionar item"
                  />
                  <Button type="button" onClick={addChecklistItem} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleChecklistItem(item)}
                        className={`flex-1 flex items-center gap-2 p-2 rounded border ${
                          item.completed ? 'bg-muted' : ''
                        }`}
                      >
                        <Check
                          className={`h-4 w-4 ${
                            item.completed ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                        <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                          {item.title}
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteChecklistItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Anexos</Label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Enviando...' : 'Enviar Arquivo'}
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 flex-1 hover:text-primary"
                      >
                        <Download className="h-4 w-4" />
                        <span className="truncate">{attachment.file_name}</span>
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAttachment(attachment)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.title.trim()}>
              {loading ? 'Salvando...' : card ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardDialog;
