import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Plus, Trash2, ExternalLink, Pencil, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Service } from "./ServicesSection";
import { Badge } from "@/components/ui/badge";

type ShareLinkManagerProps = {
  services: Service[];
};

type ShareLink = {
  id: string;
  name: string;
  share_token: string;
  recipient_name: string | null;
  is_active: boolean;
  expires_at: string | null;
};

const ShareLinkManager = ({ services }: ShareLinkManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingLink, setEditingLink] = useState<ShareLink | null>(null);
  const [newLinkName, setNewLinkName] = useState("");
  const [newRecipientName, setNewRecipientName] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [expirationDays, setExpirationDays] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: shareLinks = [] } = useQuery({
    queryKey: ["service-share-links"],
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
    queryKey: ["service-link-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_link_items")
        .select("*");

      if (error) throw error;
      return data as { id: string; link_id: string; service_id: string }[];
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async () => {
      const token = Math.random().toString(36).substring(2, 15);
      
      let expiresAt = null;
      if (expirationDays) {
        const days = parseInt(expirationDays);
        if (!isNaN(days) && days > 0) {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + days);
        }
      }

      const { data: link, error: linkError } = await supabase
        .from("service_share_links")
        .insert([
          {
            name: newLinkName,
            recipient_name: newRecipientName || null,
            share_token: token,
            expires_at: expiresAt?.toISOString() || null,
          },
        ])
        .select()
        .single();

      if (linkError) throw linkError;

      const items = selectedServices.map((serviceId) => ({
        link_id: link.id,
        service_id: serviceId,
      }));

      const { error: itemsError } = await supabase
        .from("service_link_items")
        .insert(items);

      if (itemsError) throw itemsError;

      return link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-share-links"] });
      queryClient.invalidateQueries({ queryKey: ["service-link-items"] });
      toast.success("Link criado com sucesso");
      setIsCreating(false);
      setNewLinkName("");
      setNewRecipientName("");
      setSelectedServices([]);
      setExpirationDays("");
    },
    onError: () => {
      toast.error("Erro ao criar link");
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async () => {
      if (!editingLink) return;

      let expiresAt = null;
      if (expirationDays) {
        const days = parseInt(expirationDays);
        if (!isNaN(days) && days > 0) {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + days);
        }
      }

      const { error: updateError } = await supabase
        .from("service_share_links")
        .update({
          name: newLinkName,
          recipient_name: newRecipientName || null,
          expires_at: expiresAt?.toISOString() || null,
        })
        .eq("id", editingLink.id);

      if (updateError) throw updateError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from("service_link_items")
        .delete()
        .eq("link_id", editingLink.id);

      if (deleteError) throw deleteError;

      // Insert new items
      const items = selectedServices.map((serviceId) => ({
        link_id: editingLink.id,
        service_id: serviceId,
      }));

      const { error: itemsError } = await supabase
        .from("service_link_items")
        .insert(items);

      if (itemsError) throw itemsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-share-links"] });
      queryClient.invalidateQueries({ queryKey: ["service-link-items"] });
      toast.success("Link atualizado com sucesso");
      setEditingLink(null);
      setNewLinkName("");
      setNewRecipientName("");
      setSelectedServices([]);
      setExpirationDays("");
    },
    onError: () => {
      toast.error("Erro ao atualizar link");
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_share_links")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-share-links"] });
      queryClient.invalidateQueries({ queryKey: ["service-link-items"] });
      toast.success("Link excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir link");
    },
  });

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/#/services/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const getServicesForLink = (linkId: string) => {
    return linkItems
      .filter((item) => item.link_id === linkId)
      .map((item) => services.find((s) => s.id === item.service_id))
      .filter(Boolean);
  };

  const startEditing = (link: ShareLink) => {
    setEditingLink(link);
    setNewLinkName(link.name);
    setNewRecipientName(link.recipient_name || "");
    const linkServiceIds = linkItems
      .filter((item) => item.link_id === link.id)
      .map((item) => item.service_id);
    setSelectedServices(linkServiceIds);
    setExpirationDays("");
  };

  const cancelEditing = () => {
    setEditingLink(null);
    setIsCreating(false);
    setNewLinkName("");
    setNewRecipientName("");
    setSelectedServices([]);
    setExpirationDays("");
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-4">
      {!isCreating && !editingLink ? (
        <Button onClick={() => setIsCreating(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Link
        </Button>
      ) : (
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-lg">
            {editingLink ? "Editar Link" : "Criar Novo Link"}
          </h3>
          
          <div>
            <Label htmlFor="link-name">Nome do Link</Label>
            <Input
              id="link-name"
              value={newLinkName}
              onChange={(e) => setNewLinkName(e.target.value)}
              placeholder="Ex: Orçamento João Silva"
            />
          </div>

          <div>
            <Label htmlFor="recipient-name">Nome do Destinatário (opcional)</Label>
            <Input
              id="recipient-name"
              value={newRecipientName}
              onChange={(e) => setNewRecipientName(e.target.value)}
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <Label htmlFor="expiration-days">
              Expiração (dias) - deixe vazio para permanente
            </Label>
            <Input
              id="expiration-days"
              type="number"
              min="1"
              value={expirationDays}
              onChange={(e) => setExpirationDays(e.target.value)}
              placeholder="Ex: 30"
            />
          </div>

          <div>
            <Label>Serviços Incluídos</Label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
              {services.map((service) => (
                <div key={service.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={(checked) => {
                      setSelectedServices(
                        checked
                          ? [...selectedServices, service.id]
                          : selectedServices.filter((id) => id !== service.id)
                      );
                    }}
                  />
                  <label
                    htmlFor={`service-${service.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {service.name} - R$ {service.price.toFixed(2)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={cancelEditing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => editingLink ? updateLinkMutation.mutate() : createLinkMutation.mutate()}
              disabled={!newLinkName || selectedServices.length === 0}
              className="flex-1"
            >
              {editingLink ? "Salvar" : "Criar Link"}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {shareLinks.map((link) => {
          const linkServices = getServicesForLink(link.id);
          const expired = isExpired(link.expires_at);
          
          return (
            <Card key={link.id} className={`p-4 ${expired ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{link.name}</h4>
                    {expired && (
                      <Badge variant="destructive" className="text-xs">
                        Expirado
                      </Badge>
                    )}
                    {link.expires_at && !expired && (
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        Expira em {new Date(link.expires_at).toLocaleDateString('pt-BR')}
                      </Badge>
                    )}
                  </div>
                  {link.recipient_name && (
                    <p className="text-sm text-muted-foreground">
                      Para: {link.recipient_name}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing(link)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(link.share_token)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(`/#/services/${link.share_token}`, "_blank")
                    }
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteLinkMutation.mutate(link.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {linkServices.length} serviço(s) incluído(s)
              </p>
              <div className="flex flex-wrap gap-1">
                {linkServices.map((service) => (
                  <span
                    key={service?.id}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {service?.name}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ShareLinkManager;
