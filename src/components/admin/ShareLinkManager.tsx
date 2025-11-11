import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Service } from "./ServicesSection";

type ShareLinkManagerProps = {
  services: Service[];
};

type ShareLink = {
  id: string;
  name: string;
  share_token: string;
  recipient_name: string | null;
  is_active: boolean;
};

const ShareLinkManager = ({ services }: ShareLinkManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newLinkName, setNewLinkName] = useState("");
  const [newRecipientName, setNewRecipientName] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
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
      const { data: link, error: linkError } = await supabase
        .from("service_share_links")
        .insert([
          {
            name: newLinkName,
            recipient_name: newRecipientName || null,
            share_token: token,
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
    },
    onError: () => {
      toast.error("Erro ao criar link");
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

  return (
    <div className="space-y-4">
      {!isCreating ? (
        <Button onClick={() => setIsCreating(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Link
        </Button>
      ) : (
        <Card className="p-4 space-y-4">
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
              onClick={() => setIsCreating(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => createLinkMutation.mutate()}
              disabled={!newLinkName || selectedServices.length === 0}
              className="flex-1"
            >
              Criar Link
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {shareLinks.map((link) => {
          const linkServices = getServicesForLink(link.id);
          return (
            <Card key={link.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{link.name}</h4>
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
