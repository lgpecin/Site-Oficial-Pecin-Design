import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link2, Trash2, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

interface ShareLink {
  id: string;
  share_token: string;
  name: string;
  recipient_name: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface ClientShareLinkManagerProps {
  clientId: string;
}

const ClientShareLinkManager = ({ clientId }: ClientShareLinkManagerProps) => {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLinks();
  }, [clientId]);

  const loadLinks = async () => {
    const { data, error } = await supabase
      .from('client_share_links')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erro ao carregar links', variant: 'destructive' });
    } else {
      setLinks(data || []);
    }
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({ title: 'Preencha o nome do link', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const token = generateToken();

    const { error } = await supabase
      .from('client_share_links')
      .insert([{
        client_id: clientId,
        share_token: token,
        name,
        recipient_name: recipientName || null,
      }]);

    setLoading(false);

    if (error) {
      toast({ title: 'Erro ao criar link', variant: 'destructive' });
    } else {
      toast({ title: 'Link criado com sucesso!' });
      setShowForm(false);
      setName('');
      setRecipientName('');
      loadLinks();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('client_share_links')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({ title: 'Erro ao deletar link', variant: 'destructive' });
    } else {
      toast({ title: 'Link deletado com sucesso!' });
      loadLinks();
    }
    setDeleteId(null);
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/#/client-materials/${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copiado!' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Links de Aprovação
          </CardTitle>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            {showForm ? 'Cancelar' : 'Novo Link'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleCreate} className="space-y-4 p-4 border rounded-lg">
            <div>
              <Label htmlFor="name">Nome do Link *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Link para aprovação Janeiro 2025"
                required
              />
            </div>
            <div>
              <Label htmlFor="recipient">Nome do Destinatário (opcional)</Label>
              <Input
                id="recipient"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Link'}
            </Button>
          </form>
        )}

        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{link.name}</div>
                {link.recipient_name && (
                  <div className="text-sm text-muted-foreground">Para: {link.recipient_name}</div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Criado em {new Date(link.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={link.is_active ? 'default' : 'secondary'}>
                  {link.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyLink(link.share_token)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(link.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {links.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum link criado ainda
            </div>
          )}
        </div>
      </CardContent>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este link? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ClientShareLinkManager;
