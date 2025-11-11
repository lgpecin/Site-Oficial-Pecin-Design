import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, Check, X, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface MaterialFile {
  id: string;
  file_path: string;
  file_type: string;
}

interface Approval {
  id: string;
  action_type: string;
  comment: string | null;
  created_at: string;
  user_id: string;
}

const ClientMaterialsPortal = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [files, setFiles] = useState<MaterialFile[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [comment, setComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Verificar link compartilhável
  useEffect(() => {
    const verifyShareLink = async () => {
      if (!token) {
        navigate('/');
        return;
      }

      const { data: shareLink, error } = await supabase
        .from('client_share_links')
        .select('client_id, clients(name), is_active, expires_at')
        .eq('share_token', token)
        .maybeSingle();

      if (error || !shareLink || !shareLink.is_active) {
        toast({ 
          title: 'Link inválido ou expirado',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }

      // Verificar expiração
      if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
        toast({ 
          title: 'Link expirado',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }

      setClientId(shareLink.client_id);
      setClientName((shareLink.clients as any)?.name || '');
    };

    verifyShareLink();
  }, [token, navigate, toast]);

  // Autenticação
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fazer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verificar se o usuário tem acesso a este cliente
      const { data: access, error: accessError } = await supabase
        .from('client_users')
        .select('id')
        .eq('client_id', clientId)
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (accessError || !access) {
        await supabase.auth.signOut();
        throw new Error('Você não tem acesso a este cliente');
      }

      setCurrentUserId(authData.user.id);
      setIsAuthenticated(true);
      toast({ title: 'Login realizado com sucesso!' });
      loadMaterials();
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    if (!clientId) return;

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

  const loadMaterialDetails = async (materialId: string) => {
    // Carregar arquivos
    const { data: filesData, error: filesError } = await supabase
      .from('material_files')
      .select('*')
      .eq('material_id', materialId)
      .order('display_order');

    if (!filesError) {
      setFiles(filesData || []);
    }

    // Carregar aprovações com emails dos usuários
    const { data: approvalsData, error: approvalsError } = await supabase
      .from('material_approvals')
      .select('*')
      .eq('material_id', materialId)
      .order('created_at', { ascending: false });

    if (!approvalsError && approvalsData) {
      // Buscar emails dos usuários
      const userIds = approvalsData.map(a => a.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.email]));
      const approvalsWithEmail = approvalsData.map(approval => ({
        ...approval,
        email: profileMap.get(approval.user_id) || 'Usuário desconhecido'
      }));
      
      setApprovals(approvalsWithEmail as any);
    }
  };

  const handleAction = async (actionType: 'approve' | 'reject' | 'comment') => {
    if (!selectedMaterial || !currentUserId) return;

    const { error } = await supabase
      .from('material_approvals')
      .insert([{
        material_id: selectedMaterial.id,
        user_id: currentUserId,
        action_type: actionType,
        comment: comment || null,
      }]);

    if (error) {
      toast({ title: 'Erro ao registrar ação', variant: 'destructive' });
    } else {
      toast({ title: 'Ação registrada com sucesso!' });
      setComment('');
      loadMaterialDetails(selectedMaterial.id);
    }
  };

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from('client-materials').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    navigate('/');
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || material.type === filterType;
    const matchesStatus = filterStatus === 'all' || material.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Tela de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Portal de Aprovação</CardTitle>
            {clientName && <p className="text-sm text-muted-foreground">Cliente: {clientName}</p>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de materiais
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{clientName}</h1>
            <p className="text-muted-foreground">Portal de Aprovação de Materiais</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sair
          </Button>
        </div>

        {!selectedMaterial ? (
          <>
            <div className="flex gap-4">
              <Input
                placeholder="Buscar materiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setSelectedMaterial(material);
                    loadMaterialDetails(material.id);
                  }}>
                  <CardHeader>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{material.type}</Badge>
                      <Badge>{material.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {material.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {material.description}
                      </p>
                    )}
                    {material.post_date && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Data: {new Date(material.post_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <Button variant="outline" onClick={() => setSelectedMaterial(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>{selectedMaterial.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedMaterial.type}</Badge>
                  <Badge>{selectedMaterial.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedMaterial.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <p className="text-muted-foreground">{selectedMaterial.description}</p>
                  </div>
                )}
                {selectedMaterial.caption && (
                  <div>
                    <h3 className="font-semibold mb-2">Legenda</h3>
                    <p className="text-muted-foreground">{selectedMaterial.caption}</p>
                  </div>
                )}
                {selectedMaterial.post_date && (
                  <div>
                    <h3 className="font-semibold mb-2">Data de Publicação</h3>
                    <p className="text-muted-foreground">
                      {new Date(selectedMaterial.post_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Arquivos</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {files.map((file) => (
                      <div key={file.id} className="border rounded-lg overflow-hidden">
                        {file.file_type.startsWith('image/') ? (
                          <img src={getFileUrl(file.file_path)} alt="" className="w-full h-auto" />
                        ) : (
                          <video src={getFileUrl(file.file_path)} controls className="w-full" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Ações</h3>
                  <Textarea
                    placeholder="Comentário (opcional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleAction('approve')} className="gap-2">
                      <Check className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button onClick={() => handleAction('reject')} variant="destructive" className="gap-2">
                      <X className="h-4 w-4" />
                      Reprovar
                    </Button>
                    <Button onClick={() => handleAction('comment')} variant="outline" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comentar
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Histórico</h3>
                  <div className="space-y-2">
                    {approvals.map((approval) => (
                      <div key={approval.id} className="flex items-start gap-2 p-2 border rounded">
                        <Badge variant={
                          approval.action_type === 'approve' ? 'default' :
                          approval.action_type === 'reject' ? 'destructive' : 'secondary'
                        }>
                          {approval.action_type === 'approve' ? 'Aprovado' :
                           approval.action_type === 'reject' ? 'Reprovado' : 'Comentário'}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{(approval as any).email}</p>
                          {approval.comment && (
                            <p className="text-sm text-muted-foreground">{approval.comment}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(approval.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientMaterialsPortal;
