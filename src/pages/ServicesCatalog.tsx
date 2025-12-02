import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Clock, DollarSign, Search, Folder, Palette, Sparkles, Target, Zap, Camera, Film, Layout, Package, Megaphone, BookOpen } from "lucide-react";

// Icon map for dynamic imports
const iconMap: Record<string, React.ComponentType<any>> = {
  Folder,
  Palette,
  Sparkles,
  Target,
  Zap,
  Camera,
  Film,
  Layout,
  Package,
  Megaphone,
  BookOpen,
};
import logo from "@/assets/logo.png";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  delivery_days: number;
  icon: string | null;
  color: string | null;
  display_order: number;
};

const ServicesCatalog = () => {
  const { token } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: shareLink, isLoading: linkLoading } = useQuery({
    queryKey: ["service-share-link", token],
    queryFn: async () => {
      if (!token) throw new Error("Token inválido");
      
      const { data, error } = await supabase
        .from("service_share_links")
        .select("*")
        .eq("share_token", token)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Link não encontrado");
      
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error("Link expirado");
      }
      
      return data;
    },
    retry: false,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["catalog-services", shareLink?.id],
    queryFn: async () => {
      if (!shareLink?.id) return [];

      const { data: items, error: itemsError } = await supabase
        .from("service_link_items")
        .select("service_id")
        .eq("link_id", shareLink.id);

      if (itemsError) throw itemsError;

      const serviceIds = items.map((item) => item.service_id);
      if (serviceIds.length === 0) return [];

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

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    
    const query = searchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  const servicesByCategory = useMemo(() => {
    const grouped = filteredServices.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, Service[]>);
    return grouped;
  }, [filteredServices]);

  const categories = Object.keys(servicesByCategory).sort();

  if (linkLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  if (!shareLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Link não encontrado</h1>
          <p className="text-muted-foreground">
            Este link de orçamento não existe, foi desativado ou expirou.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-12 w-auto mx-auto mb-4" loading="lazy" decoding="async" />
          <h1 className="text-3xl font-bold mb-2">Orçamento de Serviços</h1>
          {shareLink.recipient_name && (
            <p className="text-lg text-muted-foreground">
              Para: {shareLink.recipient_name}
            </p>
          )}
        </div>

        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar serviços..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "Nenhum serviço encontrado." : "Nenhum serviço disponível neste orçamento."}
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-6">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servicesByCategory[category].map((service) => {
                    const IconComponent = service.icon
                      ? iconMap[service.icon] || Folder
                      : Folder;

                    return (
                      <Card
                        key={service.id}
                        className="p-4 hover:shadow-lg transition-all duration-200 border-2"
                        style={{ borderColor: service.color || "#6366f1" }}
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div
                            className="p-3 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: `${service.color}20` }}
                          >
                            <IconComponent
                              className="w-6 h-6"
                              style={{ color: service.color || "#6366f1" }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base mb-1 line-clamp-2">{service.name}</h3>
                            {service.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {service.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-primary" />
                              <span className="text-xs text-muted-foreground">Preço</span>
                            </div>
                            <span className="font-bold text-base text-primary">
                              R$ {service.price.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Prazo</span>
                            </div>
                            <span className="font-semibold text-sm">
                              {service.delivery_days} dias úteis
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesCatalog;
