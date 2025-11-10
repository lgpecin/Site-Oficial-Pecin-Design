import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
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

interface ClientUserManagementProps {
  clientId: string;
}

interface User {
  id: string;
  email: string;
}

interface ClientUser {
  id: string;
  user_id: string;
  profiles: {
    email: string;
  };
}

const ClientUserManagement = ({ clientId }: ClientUserManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    // Carregar todos os usuários com role de cliente
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email');

    if (profiles) {
      // Filtrar apenas usuários com role de cliente
      const { data: clientRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client');

      const clientUserIds = clientRoles?.map(r => r.user_id) || [];
      const clientProfiles = profiles.filter(p => clientUserIds.includes(p.id));
      setUsers(clientProfiles);
    }

    // Carregar usuários já vinculados a este cliente
    await loadClientUsers();
  };

  const loadClientUsers = async () => {
    const { data } = await supabase
      .from('client_users')
      .select(`
        id,
        user_id,
        profiles:user_id (email)
      `)
      .eq('client_id', clientId);

    // Transformar dados para o tipo correto
    if (data) {
      const transformedData = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        profiles: {
          email: Array.isArray(item.profiles) ? item.profiles[0]?.email || '' : ''
        }
      }));
      setClientUsers(transformedData);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('client_users')
        .insert([{ client_id: clientId, user_id: selectedUserId }]);

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Este usuário já está vinculado a este cliente', variant: 'destructive' });
        } else {
          throw error;
        }
      } else {
        toast({ title: 'Usuário vinculado com sucesso!' });
        setSelectedUserId('');
        loadClientUsers();
      }
    } catch (error) {
      toast({ title: 'Erro ao vincular usuário', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('client_users')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({ title: 'Erro ao remover vínculo', variant: 'destructive' });
    } else {
      toast({ title: 'Vínculo removido com sucesso!' });
      loadClientUsers();
    }
    setDeleteId(null);
  };

  const availableUsers = users.filter(
    u => !clientUsers.some(cu => cu.user_id === u.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários com Acesso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddUser} disabled={!selectedUserId || loading}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        <div className="space-y-2">
          {clientUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum usuário vinculado ainda
            </p>
          ) : (
            clientUsers.map((clientUser) => (
              <div
                key={clientUser.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="text-sm">{clientUser.profiles.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(clientUser.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o acesso deste usuário a este cliente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ClientUserManagement;
