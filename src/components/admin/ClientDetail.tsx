import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, ExternalLink } from 'lucide-react';
import MaterialForm from './MaterialForm';
import MaterialCard from './MaterialCard';
import ClientUserManagement from './ClientUserManagement';

interface Material {
  id: string;
  title: string;
  type: string;
  description: string | null;
  caption: string | null;
  post_date: string | null;
  status: string;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
}

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
}

const ClientDetail = ({ clientId, onBack }: ClientDetailProps) => {
  const [client, setClient] = useState<Client | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    setLoading(true);
    
    // Carregar dados do cliente
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError) {
      toast({ title: 'Erro ao carregar cliente', variant: 'destructive' });
      return;
    }

    setClient(clientData);

    // Carregar materiais
    await loadMaterials();
    setLoading(false);
  };

  const loadMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erro ao carregar materiais', variant: 'destructive' });
    } else {
      setMaterials(data || []);
    }
  };

  const handleEdit = (materialId: string) => {
    setEditingId(materialId);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingId(null);
    loadMaterials();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const copyClientLink = () => {
    const link = `${window.location.origin}/#/client-portal/${clientId}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copiado para a área de transferência!' });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!client) {
    return <div>Cliente não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-3xl font-bold">{client.name}</h2>
            {client.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyClientLink}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Copiar Link do Cliente
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Material
          </Button>
        </div>
      </div>

      {showForm && (
        <MaterialForm
          clientId={clientId}
          materialId={editingId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      <ClientUserManagement clientId={clientId} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materials.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            onEdit={handleEdit}
            onDelete={loadMaterials}
          />
        ))}
      </div>

      {materials.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum material criado ainda. Clique em "Novo Material" para começar.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientDetail;
