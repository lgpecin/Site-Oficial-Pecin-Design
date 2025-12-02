import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, LayoutGrid, List, GripVertical, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import ServiceCard from "./ServiceCard";
import ServiceForm from "./ServiceForm";
import ShareLinkManager from "./ShareLinkManager";
import DataExportImport from "./DataExportImport";
import * as Icons from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  delivery_days: number;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  display_order: number;
};

const ServicesSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isShareManagerOpen, setIsShareManagerOpen] = useState(false);
  const [draggedService, setDraggedService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const queryClient = useQueryClient();

  // Fixed category order - categories will always appear in this sequence
  const categoryOrder = [
    'estatico',
    'carrossel', 
    'reels',
    'branding',
    'marca',
    'ebook',
    'outros'
  ];

  const categoryNames: Record<string, string> = {
    estatico: 'Estático',
    carrossel: 'Carrossel',
    reels: 'Reels',
    branding: 'Branding',
    marca: 'Marca',
    ebook: 'E-book',
    outros: 'Outros',
  };

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir serviço");
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, display_order }: { id: string; display_order: number }) => {
      const { error } = await supabase
        .from("services")
        .update({ display_order })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const groupedServices = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingService(null);
  };

  const handleDragStart = (e: React.DragEvent, service: Service) => {
    setDraggedService(service);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedService(null);
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e: React.DragEvent, targetService: Service) => {
    e.currentTarget.classList.remove('drag-over');
    
    if (!draggedService || draggedService.id === targetService.id) {
      setDraggedService(null);
      return;
    }

    // If moving within the same category, reorder
    if (draggedService.category === targetService.category) {
      const categoryServices = groupedServices[draggedService.category];
      const draggedIndex = categoryServices.findIndex((s) => s.id === draggedService.id);
      const targetIndex = categoryServices.findIndex((s) => s.id === targetService.id);

      // Reorder and update display_order
      const reordered = [...categoryServices];
      reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, draggedService);

      // Update display_order for all affected services
      await Promise.all(
        reordered.map((service, index) =>
          updateOrderMutation.mutateAsync({
            id: service.id,
            display_order: index,
          })
        )
      );
    } else {
      // Moving to a different category
      const { error } = await supabase
        .from("services")
        .update({
          category: targetService.category as any,
          display_order: targetService.display_order,
        })
        .eq("id", draggedService.id);

      if (error) {
        toast.error("Erro ao mover serviço");
      } else {
        queryClient.invalidateQueries({ queryKey: ["services"] });
        toast.success("Serviço movido com sucesso");
      }
    }

    setDraggedService(null);
  };

  return (
    <div className="space-y-6">
      <style>{`
        .drag-item {
          will-change: transform, opacity;
        }
        
        .drag-item.dragging {
          opacity: 0.4;
          transform: scale(0.95) rotate(2deg);
        }
        
        .drag-item.drag-over {
          transform: scale(1.05);
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.3),
                      0 20px 40px -10px hsl(var(--primary) / 0.4);
          border-radius: 12px;
        }
        
        .drag-item:hover:not(.dragging) {
          box-shadow: 0 10px 30px -10px hsl(var(--primary) / 0.2);
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        .drag-item.dragging {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Orçamentos e Serviços</h2>
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <DataExportImport 
            tableName="services" 
            buttonLabel="Serviços"
            onImportSuccess={() => queryClient.invalidateQueries({ queryKey: ["services"] })}
          />
          <Button onClick={() => setIsShareManagerOpen(true)} variant="outline" className="flex-1 sm:flex-none">
            Gerenciar Links
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar serviços..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {Object.entries(categoryNames).map(([key, name]) => (
              <SelectItem key={key} value={key}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando serviços...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum serviço encontrado
        </div>
      ) : (
        <div className="space-y-8">
          {categoryOrder
            .filter(category => groupedServices[category] && groupedServices[category].length > 0)
            .map((category) => {
              const categoryServices = groupedServices[category];
              return (
            <div key={category}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {categoryNames[category] || category}
                <Badge variant="secondary">{categoryServices.length}</Badge>
              </h3>
              
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, service)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, service)}
                      className={`
                        cursor-move transition-all duration-300 ease-out
                        ${draggedService?.id === service.id ? "opacity-40 scale-95" : "opacity-100 scale-100"}
                        hover:scale-[1.02] active:scale-[0.98]
                        drag-item
                      `}
                      style={{
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <ServiceCard
                        service={service}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {categoryServices.map((service) => {
                    const IconComponent = service.icon ? (Icons as any)[service.icon] : Icons.Folder;
                    return (
                      <Card
                        key={service.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, service)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, service)}
                        className={`
                          cursor-move transition-all duration-300 ease-out
                          ${draggedService?.id === service.id ? "opacity-40 scale-[0.98]" : "opacity-100 scale-100"}
                          hover:bg-muted/50 active:scale-[0.98]
                          drag-item
                        `}
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <div className="flex items-center gap-4 p-4">
                          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${service.color}20` }}
                          >
                            <IconComponent className="h-5 w-5" style={{ color: service.color }} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{service.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {service.description || "Sem descrição"}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <div className="font-semibold text-primary">
                                R$ {service.price.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {service.delivery_days} {service.delivery_days === 1 ? 'dia' : 'dias'}
                              </div>
                            </div>
                            
                            <Badge variant={service.is_active ? "default" : "secondary"}>
                              {service.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                            
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(service)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(service.id)}
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )})}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          <ServiceForm service={editingService} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>

      <Dialog open={isShareManagerOpen} onOpenChange={setIsShareManagerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Links Compartilháveis</DialogTitle>
          </DialogHeader>
          <ShareLinkManager services={services} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesSection;
