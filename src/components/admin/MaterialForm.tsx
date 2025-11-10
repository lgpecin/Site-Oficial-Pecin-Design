import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface MaterialFormProps {
  clientId: string;
  materialId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const MATERIAL_TYPES = ['ESTÁTICO', 'STORIES', 'REELS', 'THUMB', 'ÍCONE', 'CARROSSEL'];
const STATUS_OPTIONS = ['Pronto', 'Em Processo', 'Ideia', 'Planejamento', 'Cancelado'];

const MaterialForm = ({ clientId, materialId, onSuccess, onCancel }: MaterialFormProps) => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    type: 'ESTÁTICO',
    description: '',
    caption: '',
    post_date: '',
    status: 'Ideia',
  });

  useEffect(() => {
    if (materialId) {
      loadMaterial();
    }
  }, [materialId]);

  const loadMaterial = async () => {
    if (!materialId) return;

    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', materialId)
      .single();

    if (error) {
      toast({ title: 'Erro ao carregar material', variant: 'destructive' });
    } else {
      setFormData({
        title: data.title,
        type: data.type,
        description: data.description || '',
        caption: data.caption || '',
        post_date: data.post_date || '',
        status: data.status,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadFiles = async (materialId: string) => {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${materialId}/${Date.now()}_${index}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('client-materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const fileType = file.type.startsWith('video/') ? 'video' : 'image';

      const { error: dbError } = await supabase.from('material_files').insert([
        {
          material_id: materialId,
          file_path: fileName,
          file_type: fileType,
          file_size: file.size,
          display_order: index,
        },
      ]);

      if (dbError) throw dbError;
    });

    await Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Título é obrigatório', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (materialId) {
        // Atualizar material existente
        const { error } = await supabase
          .from('materials')
          .update(formData)
          .eq('id', materialId);

        if (error) throw error;

        // Upload de novos arquivos se houver
        if (files.length > 0) {
          await uploadFiles(materialId);
        }

        toast({ title: 'Material atualizado com sucesso!' });
      } else {
        // Criar novo material
        const { data, error } = await supabase
          .from('materials')
          .insert([{ ...formData, client_id: clientId }])
          .select()
          .single();

        if (error) throw error;

        // Upload dos arquivos
        if (files.length > 0) {
          await uploadFiles(data.id);
        }

        toast({ title: 'Material criado com sucesso!' });
      }

      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Erro ao salvar material', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{materialId ? 'Editar Material' : 'Novo Material'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Tipo *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="post_date">Data de Postagem</Label>
          <Input
            id="post_date"
            type="date"
            value={formData.post_date}
            onChange={(e) => setFormData({ ...formData, post_date: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="caption">Legenda</Label>
          <Textarea
            id="caption"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="files">Arquivos (Imagens/Vídeos)</Label>
          <Input
            id="files"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaterialForm;
