import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, FolderOpen, Folder } from 'lucide-react';
import * as Icons from 'lucide-react';
import ClientDetail from './ClientDetail';
import DataExportImport from './DataExportImport';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  icon: string | null;
  color: string | null;
}

const ClientsSection = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    icon: 'Folder',
    color: '#6366f1',
  });

  const iconOptions = [
    'Folder', 'Briefcase', 'Building', 'Users', 'User', 'Store',
    'ShoppingBag', 'Package', 'Truck', 'Heart', 'Star', 'Zap'
  ];

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erro ao carregar clientes', variant: 'destructive' });
    } else {
      setClients(data || []);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Cliente atualizado com sucesso!' });
      } else {
        const { error } = await supabase.from('clients').insert([formData]);

        if (error) throw error;
        toast({ title: 'Cliente criado com sucesso!' });
      }

      resetForm();
      loadClients();
    } catch (error) {
      toast({ title: 'Erro ao salvar cliente', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      notes: client.notes || '',
      icon: client.icon || 'Folder',
      color: client.color || '#6366f1',
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('clients').delete().eq('id', deleteId);

    if (error) {
      toast({ title: 'Erro ao excluir cliente', variant: 'destructive' });
    } else {
      toast({ title: 'Cliente excluído com sucesso!' });
      loadClients();
    }
    setDeleteId(null);
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      email: '', 
      phone: '', 
      company: '', 
      notes: '',
      icon: 'Folder',
      color: '#6366f1'
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (selectedClientId) {
    return (
      <ClientDetail
        clientId={selectedClientId}
        onBack={() => setSelectedClientId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Clientes</h2>
        <div className="flex gap-2">
          <DataExportImport 
            tableName="clients" 
            buttonLabel="Clientes"
            onImportSuccess={loadClients}
          />
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Ícone</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger id="icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((iconName) => {
                      const IconComponent = (Icons as any)[iconName];
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {iconName}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="color">Cor</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={loading || !formData.name}>
                Salvar
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {clients.map((client) => {
          const ClientIcon = client.icon ? (Icons as any)[client.icon] || Folder : Folder;
          return (
            <Card key={client.id} className="border-l-4" style={{ borderLeftColor: client.color || '#6366f1' }}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 flex-1">
                    <div 
                      className="p-3 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${client.color || '#6366f1'}20` }}
                    >
                      <ClientIcon 
                        className="w-6 h-6" 
                        style={{ color: client.color || '#6366f1' }}
                      />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className="text-xl font-semibold">{client.name}</h3>
                      {client.company && <p className="text-sm text-muted-foreground">{client.company}</p>}
                      {client.email && <p className="text-sm">{client.email}</p>}
                      {client.phone && <p className="text-sm">{client.phone}</p>}
                      {client.notes && <p className="text-sm mt-2 text-muted-foreground">{client.notes}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={() => setSelectedClientId(client.id)}>
                    <FolderOpen className="h-4 w-4 mr-1" />
                    Abrir
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteId(client.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
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

export default ClientsSection;
