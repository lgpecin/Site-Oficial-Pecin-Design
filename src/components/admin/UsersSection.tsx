import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import UserCreationForm from './UserCreationForm';
import UserEditDialog from './UserEditDialog';
import DataExportImport from './DataExportImport';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserWithRole {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'visitor' | null;
  expires_at: string | null;
}

const UsersSection = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [editingUser, setEditingUser] = useState<{ id: string; email: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Carregar perfis
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, expires_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Carregar roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combinar dados
      const usersWithRoles = profiles?.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email || '',
          role: userRole?.role as any || null,
          expires_at: profile.expires_at,
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      toast({ title: 'Erro ao carregar usuários', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Remover role anterior
      await supabase.from('user_roles').delete().eq('user_id', userId);

      // Adicionar nova role se não for "visitor"
      if (newRole === 'visitor') {
        const { error } = await supabase.from('user_roles').insert([
          { user_id: userId, role: 'visitor' as any }
        ]);
        if (error) throw error;
      } else if (newRole !== 'none') {
        const { error } = await supabase.from('user_roles').insert([
          { user_id: userId, role: newRole as any }
        ]);
        if (error) throw error;
      }

      toast({ title: 'Permissão atualizada com sucesso!' });
      loadUsers();
    } catch (error) {
      toast({ title: 'Erro ao atualizar permissão', variant: 'destructive' });
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <Badge variant="outline">Visitante</Badge>;
    
    const roleMap = {
      admin: <Badge variant="destructive">Admin</Badge>,
      client: <Badge>Cliente</Badge>,
      visitor: <Badge variant="outline">Visitante</Badge>,
    };

    return roleMap[role as keyof typeof roleMap] || <Badge variant="outline">Visitante</Badge>;
  };

  const getExpirationStatus = (expiresAt: string | null) => {
    if (!expiresAt) return <Badge variant="secondary">Permanente</Badge>;
    
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    
    if (expirationDate < now) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration <= 7) {
      return <Badge variant="outline">Expira em {daysUntilExpiration} dia{daysUntilExpiration !== 1 ? 's' : ''}</Badge>;
    }
    
    return <Badge variant="secondary">Expira em {expirationDate.toLocaleDateString('pt-BR')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Usuários</h2>
        <div className="flex gap-2">
          <DataExportImport 
            tableName="profiles" 
            buttonLabel="Usuários"
            onImportSuccess={loadUsers}
          />
          <Button onClick={() => setShowCreationForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo Usuário
          </Button>
        </div>
      </div>

      {showCreationForm && (
        <UserCreationForm
          onSuccess={() => {
            setShowCreationForm(false);
            loadUsers();
          }}
          onCancel={() => setShowCreationForm(false)}
        />
      )}

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="font-medium break-all">{user.email}</p>
                    <div className="flex flex-wrap gap-2">
                      {getRoleBadge(user.role)}
                      {getExpirationStatus(user.expires_at)}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser({ id: user.id, email: user.email })}
                    >
                      <Edit className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Select
                      value={user.role || 'none'}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Permissão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Visitante</SelectItem>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingUser && (
        <UserEditDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onSuccess={loadUsers}
        />
      )}
    </div>
  );
};

export default UsersSection;
