import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

interface RPGSheet {
  id: string;
  character_name: string;
  character_class: string | null;
  level: number;
  race: string | null;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  max_hp: number;
  current_hp: number;
  armor_class: number;
}

const SheetsSection = () => {
  const [sheets, setSheets] = useState<RPGSheet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    character_name: '',
    character_class: '',
    level: 1,
    race: '',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    max_hp: 10,
    current_hp: 10,
    armor_class: 10,
  });

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    const { data, error } = await supabase
      .from('rpg_sheets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erro ao carregar fichas', variant: 'destructive' });
    } else {
      setSheets(data || []);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('rpg_sheets')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Ficha atualizada com sucesso!' });
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('rpg_sheets').insert([{
          ...formData,
          user_id: user?.id,
        }]);

        if (error) throw error;
        toast({ title: 'Ficha criada com sucesso!' });
      }

      resetForm();
      loadSheets();
    } catch (error) {
      toast({ title: 'Erro ao salvar ficha', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sheet: RPGSheet) => {
    setEditingId(sheet.id);
    setFormData({
      character_name: sheet.character_name,
      character_class: sheet.character_class || '',
      level: sheet.level,
      race: sheet.race || '',
      strength: sheet.strength,
      dexterity: sheet.dexterity,
      constitution: sheet.constitution,
      intelligence: sheet.intelligence,
      wisdom: sheet.wisdom,
      charisma: sheet.charisma,
      max_hp: sheet.max_hp,
      current_hp: sheet.current_hp,
      armor_class: sheet.armor_class,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('rpg_sheets').delete().eq('id', deleteId);

    if (error) {
      toast({ title: 'Erro ao excluir ficha', variant: 'destructive' });
    } else {
      toast({ title: 'Ficha excluída com sucesso!' });
      loadSheets();
    }
    setDeleteId(null);
  };

  const resetForm = () => {
    setFormData({
      character_name: '',
      character_class: '',
      level: 1,
      race: '',
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      max_hp: 10,
      current_hp: 10,
      armor_class: 10,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Fichas de RPG</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ficha
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Ficha' : 'Nova Ficha'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="character_name">Nome do Personagem *</Label>
                <Input
                  id="character_name"
                  value={formData.character_name}
                  onChange={(e) => setFormData({ ...formData, character_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="character_class">Classe</Label>
                <Input
                  id="character_class"
                  value={formData.character_class}
                  onChange={(e) => setFormData({ ...formData, character_class: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="race">Raça</Label>
                <Input
                  id="race"
                  value={formData.race}
                  onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="level">Nível</Label>
                <Input
                  id="level"
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Atributos</h3>
              <div className="grid grid-cols-3 gap-4">
                {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((attr) => (
                  <div key={attr}>
                    <Label htmlFor={attr}>{attr === 'strength' ? 'Força' : attr === 'dexterity' ? 'Destreza' : attr === 'constitution' ? 'Constituição' : attr === 'intelligence' ? 'Inteligência' : attr === 'wisdom' ? 'Sabedoria' : 'Carisma'}</Label>
                    <Input
                      id={attr}
                      type="number"
                      value={formData[attr as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [attr]: parseInt(e.target.value) })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="max_hp">HP Máximo</Label>
                <Input
                  id="max_hp"
                  type="number"
                  value={formData.max_hp}
                  onChange={(e) => setFormData({ ...formData, max_hp: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="current_hp">HP Atual</Label>
                <Input
                  id="current_hp"
                  type="number"
                  value={formData.current_hp}
                  onChange={(e) => setFormData({ ...formData, current_hp: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="armor_class">Classe de Armadura</Label>
                <Input
                  id="armor_class"
                  type="number"
                  value={formData.armor_class}
                  onChange={(e) => setFormData({ ...formData, armor_class: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={loading || !formData.character_name}>
                Salvar
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {sheets.map((sheet) => (
          <Card key={sheet.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{sheet.character_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {sheet.race} {sheet.character_class} - Nível {sheet.level}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(sheet)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteId(sheet.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>HP: {sheet.current_hp}/{sheet.max_hp}</div>
                <div>CA: {sheet.armor_class}</div>
                <div>FOR: {sheet.strength}</div>
                <div>DES: {sheet.dexterity}</div>
                <div>CON: {sheet.constitution}</div>
                <div>INT: {sheet.intelligence}</div>
                <div>SAB: {sheet.wisdom}</div>
                <div>CAR: {sheet.charisma}</div>
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
              Tem certeza que deseja excluir esta ficha? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SheetsSection;
