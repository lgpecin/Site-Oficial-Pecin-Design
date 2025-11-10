import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LogOut, ThumbsUp, ThumbsDown, MessageSquare, Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Material {
  id: string;
  title: string;
  type: string;
  description: string | null;
  caption: string | null;
  post_date: string | null;
  status: string;
}

interface MaterialFile {
  id: string;
  file_path: string;
  file_type: string;
}

interface Approval {
  id: string;
  user_id: string;
  action_type: string;
  comment: string | null;
  created_at: string;
}

const ClientPortal = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<any>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [materialFiles, setMaterialFiles] = useState<MaterialFile[]>([]);
  const [approvals, setApprovals] = useState<(Approval & { userEmail?: string })[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    checkAccess();
  }, [user, clientId]);

  const checkAccess = async () => {
    if (!user || !clientId) return;

    // Verificar se usuário tem acesso a este cliente
    const { data: access } = await supabase
      .from('client_users')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', user.id)
      .single();

    if (!access) {
      toast({ title: 'Acesso negado', variant: 'destructive' });
      navigate('/');
      return;
    }

    loadData();
  };

  const loadData = async () => {
    if (!clientId) return;

    // Carregar cliente
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    setClient(clientData);

    // Carregar materiais
    const { data: materialsData } = await supabase
      .from('materials')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    setMaterials(materialsData || []);
    setLoading(false);
  };

  const loadMaterialDetails = async (material: Material) => {
    setSelectedMaterial(material);

    // Carregar arquivos
    const { data: files } = await supabase
      .from('material_files')
      .select('*')
      .eq('material_id', material.id)
      .order('display_order');

    setMaterialFiles(files || []);

    // Carregar aprovações
    const { data: approvalsData } = await supabase
      .from('material_approvals')
      .select('*')
      .eq('material_id', material.id)
      .order('created_at', { ascending: false });

    // Buscar emails dos usuários
    if (approvalsData) {
      const userIds = [...new Set(approvalsData.map(a => a.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || []);
      
      const approvalsWithEmails = approvalsData.map(approval => ({
        ...approval,
        userEmail: profileMap.get(approval.user_id) || 'Usuário desconhecido',
      }));
      
      setApprovals(approvalsWithEmails);
    }
  };

  const handleAction = async (actionType: 'approve' | 'reject' | 'comment') => {
    if (!selectedMaterial || !user) return;

    const { error } = await supabase
      .from('material_approvals')
      .insert([
        {
          material_id: selectedMaterial.id,
          user_id: user.id,
          action_type: actionType,
          comment: comment || null,
        },
      ]);

    if (error) {
      toast({ title: 'Erro ao registrar ação', variant: 'destructive' });
    } else {
      toast({ title: 'Ação registrada com sucesso!' });
      setComment('');
      loadMaterialDetails(selectedMaterial);
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('client-materials')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || material.type === filterType;
    const matchesStatus = filterStatus === 'all' || material.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{client?.name}</h1>
            <p className="text-sm text-muted-foreground">Portal de Aprovação</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!selectedMaterial ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Materiais para Aprovação</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por título ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Tipo</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="Estático">Estático</SelectItem>
                        <SelectItem value="Stories">Stories</SelectItem>
                        <SelectItem value="Reels">Reels</SelectItem>
                        <SelectItem value="Thumb">Thumb</SelectItem>
                        <SelectItem value="Ícone">Ícone</SelectItem>
                        <SelectItem value="Carrossel">Carrossel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="Ideia">Ideia</SelectItem>
                        <SelectItem value="Planejamento">Planejamento</SelectItem>
                        <SelectItem value="Em Processo">Em Processo</SelectItem>
                        <SelectItem value="Pronto">Pronto</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>{filteredMaterials.length} {filteredMaterials.length === 1 ? 'material encontrado' : 'materiais encontrados'}</span>
                </div>
              </CardContent>
            </Card>
            
            {filteredMaterials.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhum material encontrado com os filtros selecionados.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => loadMaterialDetails(material)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{material.title}</h3>
                        <Badge variant="secondary">{material.type}</Badge>
                      </div>
                      {material.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {material.description}
                        </p>
                      )}
                      <Badge>{material.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Button variant="outline" onClick={() => setSelectedMaterial(null)}>
              ← Voltar
            </Button>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedMaterial.title}</h2>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{selectedMaterial.type}</Badge>
                      <Badge>{selectedMaterial.status}</Badge>
                    </div>
                  </div>
                </div>

                {selectedMaterial.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <p className="text-muted-foreground">{selectedMaterial.description}</p>
                  </div>
                )}

                {selectedMaterial.caption && (
                  <div>
                    <h3 className="font-semibold mb-2">Legenda</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedMaterial.caption}</p>
                  </div>
                )}

                {selectedMaterial.post_date && (
                  <div>
                    <h3 className="font-semibold">Data de Postagem</h3>
                    <p className="text-muted-foreground">
                      {new Date(selectedMaterial.post_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-4">Arquivos</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {materialFiles.map((file) => (
                      <div key={file.id} className="border rounded-lg overflow-hidden">
                        {file.file_type === 'image' ? (
                          <img
                            src={getFileUrl(file.file_path)}
                            alt="Material"
                            className="w-full h-64 object-cover"
                          />
                        ) : (
                          <video
                            src={getFileUrl(file.file_path)}
                            controls
                            className="w-full h-64"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Sua Avaliação</h3>
                  <Textarea
                    placeholder="Adicione um comentário (opcional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleAction('approve')} className="flex-1">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleAction('reject')}
                      className="flex-1"
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reprovar
                    </Button>
                    <Button variant="outline" onClick={() => handleAction('comment')}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comentar
                    </Button>
                  </div>
                </div>

                {approvals.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Histórico de Avaliações</h3>
                    {approvals.map((approval) => (
                      <Card key={approval.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium">{approval.userEmail}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(approval.created_at).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <Badge
                              variant={
                                approval.action_type === 'approve'
                                  ? 'default'
                                  : approval.action_type === 'reject'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {approval.action_type === 'approve'
                                ? 'Aprovado'
                                : approval.action_type === 'reject'
                                ? 'Reprovado'
                                : 'Comentário'}
                            </Badge>
                          </div>
                          {approval.comment && (
                            <p className="text-sm text-muted-foreground">{approval.comment}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;
