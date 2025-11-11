import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Clock, DollarSign } from "lucide-react";
import * as Icons from "lucide-react";
import logo from "@/assets/logo.png";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  delivery_days: number;
  icon: string | null;
  color: string | null;
};

const ServicesCatalog = () => {
  const { token } = useParams();

  const { data: shareLink, isError, isLoading } = useQuery({
    queryKey: ["share-link", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_share_links")
        .select("*")
        .eq("share_token", token)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      
      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error("Link expirado");
      }
      
      return data;
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["catalog-services", shareLink?.id],
    queryFn: async () => {
      if (!shareLink?.id) return [];

      const { data: items, error: itemsError } = await supabase
        .from("service_link_items")
        .select("service_id")
        .eq("link_id", shareLink.id);

      if (itemsError) throw itemsError;

      const serviceIds = items.map((item) => item.service_id);

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .in("id", serviceIds)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
    enabled: !!shareLink?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!shareLink || isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Link não encontrado</h1>
          <p className="text-muted-foreground">
            Este link de orçamento não existe, foi desativado ou expirou.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Orçamento de Serviços</h1>
          {shareLink.recipient_name && (
            <p className="text-lg text-muted-foreground">
              Para: {shareLink.recipient_name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service) => {
            const IconComponent = service.icon
              ? (Icons as any)[service.icon] || Icons.Folder
              : Icons.Folder;

            return (
              <Card
                key={service.id}
                className="p-6 hover:shadow-xl transition-all duration-200 border-2"
                style={{ borderColor: service.color || "#6366f1" }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="p-4 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${service.color}20` }}
                  >
                    <IconComponent
                      className="w-8 h-8"
                      style={{ color: service.color || "#6366f1" }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl mb-2">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Preço</span>
                    </div>
                    <span className="font-bold text-xl text-primary">
                      R$ {service.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Prazo</span>
                    </div>
                    <span className="font-semibold">
                      {service.delivery_days} dias úteis
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum serviço disponível neste orçamento.
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesCatalog;
