import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "./ServicesSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Copy, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ShareLinkManagerProps {
  services: Service[];
}

type ShareLink = {
  id: string;
  name: string;
  share_token: string;
  recipient_name: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
};

type ServiceLinkItem = {
  id: string;
  link_id: string;
  service_id: string;
};

const ShareLinkManager = ({ services }: ShareLinkManagerProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ShareLink | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    recipient_name: "",
    selectedServices: [] as string[],
  });
  const queryClient = useQueryClient();

  const { data: shareLinks = [], isLoading } = useQuery({
    queryKey: ["service_share_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_share_links")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ShareLink[];
    },
  });

  const { data: linkItems = [] } = useQuery({
    queryKey: ["service_link_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_link_items")
        .select("*");

      if (error) throw error;
      return data as ServiceLinkItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const token = crypto.randomUUID();
      const { data: link, error: linkError } = await supabase
        .from("service_share_links")
        .insert({
          name: formData.name,
          recipient_name: formData.recipient_name || null,
          share_token: token,
        })
        .select()
        .single();

      if (linkError) throw linkError;

      const items = formData.selectedServices.map((serviceId) => ({
        link_id: link.id,
        service_id: serviceId,
      }));

      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from("service_link_items")
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_share_links"] });
      queryClient.invalidateQueries({ queryKey: ["service_link_items"] });
      toast.success("Link criado com sucesso");
      handleCloseForm();
    },
    onError: () => {
      toast.error("Erro ao criar link");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingLink) return;

      const { error: linkError } = await supabase
        .from("service_share_links")
        .update({
          name: formData.name,
          recipient_name: formData.recipient_name || null,
        })
        .eq("id", editingLink.id);

      if (linkError) throw linkError;

      // Delete existing items and recreate
      await supabase
        .from("service_link_items")
        .delete()
        .eq("link_id", editingLink.id);

      const items = formData.selectedServices.map((serviceId) => ({
        link_id: editingLink.id,
        service_id: serviceId,
      }));

      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from("service_link_items")
          .insert(items);

        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_share_links"] });
      queryClient.invalidateQueries({ queryKey: ["service_link_items"] });
      toast.success("Link atualizado com sucesso");
      handleCloseForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar link");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("service_link_items").delete().eq("link_id", id);
      const { error } = await supabase
        .from("service_share_links")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_share_links"] });
      queryClient.invalidateQueries({ queryKey: ["service_link_items"] });
      toast.success("Link excluído com sucesso");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Erro ao excluir link");
    },
  });

  const handleOpenForm = (link?: ShareLink) => {
    if (link) {
      setEditingLink(link);
      const linkServiceIds = linkItems
        .filter((item) => item.link_id === link.id)
        .map((item) => item.service_id);

      setFormData({
        name: link.name,
        recipient_name: link.recipient_name || "",
        selectedServices: linkServiceIds,
      });
    } else {
      setEditingLink(null);
      setFormData({
        name: "",
        recipient_name: "",
        selectedServices: [],
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLink(null);
    setFormData({
      name: "",
      recipient_name: "",
      selectedServices: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLink) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/#/services/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência");
  };

  const toggleService = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const getServiceCount = (linkId: string) => {
    return linkItems.filter((item) => item.link_id === linkId).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Crie links compartilháveis com serviços selecionados para enviar aos clientes
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Link
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando links...
        </div>
      ) : shareLinks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum link criado ainda
        </div>
      ) : (
        <div className="grid gap-4">
          {shareLinks.map((link) => (
            <Card key={link.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{link.name}</CardTitle>
                    {link.recipient_name && (
                      <CardDescription>Para: {link.recipient_name}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(link.share_token)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/#/services/${link.share_token}`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenForm(link)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {getServiceCount(link.id)} serviço(s) incluído(s)
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Editar Link" : "Novo Link"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Link *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: Orçamento Janeiro 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient_name">Nome do Cliente</Label>
              <Input
                id="recipient_name"
                value={formData.recipient_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, recipient_name: e.target.value }))
                }
                placeholder="Nome do destinatário"
              />
            </div>

            <div className="space-y-2">
              <Label>Selecionar Serviços *</Label>
              <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.id}
                      checked={formData.selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <label
                      htmlFor={service.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {service.name} - R$ {service.price}
                    </label>
                  </div>
                ))}
              </div>
              {formData.selectedServices.length === 0 && (
                <p className="text-sm text-destructive">
                  Selecione pelo menos um serviço
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  !formData.name ||
                  formData.selectedServices.length === 0 ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {editingLink ? "Atualizar" : "Criar"} Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este link? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShareLinkManager;
