import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Search, Download } from "lucide-react";
import * as Icons from "lucide-react";
import logo from "@/assets/logo.png";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { data: shareLink, isError, isLoading } = useQuery({
    queryKey: ["share-link", token],
    queryFn: async () => {
      if (!token) throw new Error("Token não fornecido");
      
      const { data, error } = await supabase
        .from("service_share_links")
        .select("*")
        .eq("share_token", token)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Link não encontrado");
      
      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error("Link expirado");
      }
      
      return data;
    },
    retry: false,
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

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("services-catalog");
      if (!element) throw new Error("Elemento não encontrado");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = shareLink?.recipient_name
        ? `Orçamento_${shareLink.recipient_name.replace(/\s+/g, "_")}.pdf`
        : "Orçamento_Serviços.pdf";

      pdf.save(fileName);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div id="services-catalog" className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="text-center mb-6 md:mb-8">
          <img src={logo} alt="Logo" className="h-10 md:h-12 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Orçamento de Serviços</h1>
          {shareLink.recipient_name && (
            <p className="text-base md:text-lg text-muted-foreground">
              Para: {shareLink.recipient_name}
            </p>
          )}
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="mt-4"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Gerando PDF..." : "Exportar PDF"}
          </Button>
        </div>

        <div className="mb-6 max-w-md mx-auto">
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
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-xl md:text-2xl font-bold mb-4 px-2">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {servicesByCategory[category].map((service) => {
                    const IconComponent = service.icon
                      ? (Icons as any)[service.icon] || Icons.Folder
                      : Icons.Folder;

                    return (
                      <Card
                        key={service.id}
                        className="p-4 md:p-6 hover:shadow-xl transition-all duration-200 border-2"
                        style={{ borderColor: service.color || "#6366f1" }}
                      >
                        <div className="flex items-start gap-3 md:gap-4 mb-4">
                          <div
                            className="p-3 md:p-4 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: `${service.color}20` }}
                          >
                            <IconComponent
                              className="w-6 h-6 md:w-8 md:h-8"
                              style={{ color: service.color || "#6366f1" }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg md:text-xl mb-2">{service.name}</h3>
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
                            <span className="font-bold text-lg md:text-xl text-primary">
                              R$ {service.price.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Prazo</span>
                            </div>
                            <span className="font-semibold text-sm md:text-base">
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
