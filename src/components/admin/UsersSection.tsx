import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
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
  role: 'admin' | 'sheet_user' | 'visitor' | null;
}

const UsersSection = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
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
        .select('id, email')
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
      sheet_user: <Badge variant="default">Usuário de Ficha</Badge>,
      visitor: <Badge variant="outline">Visitante</Badge>,
    };

    return roleMap[role as keyof typeof roleMap] || <Badge variant="outline">Visitante</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Usuários</h2>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-medium">{user.email}</p>
                    <div>{getRoleBadge(user.role)}</div>
                  </div>
                  <Select
                    value={user.role || 'none'}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Selecione a permissão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Visitante</SelectItem>
                      <SelectItem value="sheet_user">Usuário de Ficha</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersSection;
