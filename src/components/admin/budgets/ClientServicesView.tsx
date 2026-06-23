import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  LibraryBig,
  Calculator,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Building2,
  Mail,
  Phone,
  FileText,
  Wrench,
} from "lucide-react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import ClientServiceForm from "./ClientServiceForm";
import AddFromTemplateDialog from "./AddFromTemplateDialog";
import BudgetCalculator from "../BudgetCalculator";
import BudgetsList from "./BudgetsList";
import BudgetEditor from "./BudgetEditor";
import type { BudgetClient, ClientService, ClientBudget } from "./types";
import type { Service } from "../ServicesSection";

type Props = {
  client: BudgetClient;
  onBack: () => void;
};

const categoryOrder = [
  "estatico",
  "carrossel",
  "reels",
  "branding",
  "marca",
  "ebook",
  "outros",
];

const categoryNames: Record<string, string> = {
  estatico: "Estático",
  carrossel: "Carrossel",
  reels: "Reels",
  branding: "Branding",
  marca: "Marca",
  ebook: "E-book",
  outros: "Outros",
};

const ClientServicesView = ({ client, onBack }: Props) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientService | null>(null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [tab, setTab] = useState<"budgets" | "services">("budgets");
  const [activeBudget, setActiveBudget] = useState<ClientBudget | null>(null);
  const qc = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["client_services", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_services")
        .select("*")
        .eq("client_id", client.id)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ClientService[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["client_services", client.id] });
      qc.invalidateQueries({ queryKey: ["client_services_counts"] });
      toast.success("Serviço removido");
    },
  });

  const handleClose = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const grouped = services.reduce<Record<string, ClientService[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  // BudgetCalculator expects Service-shaped items; ClientService is shape-compatible.
  const calcServices: Service[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    price: s.price,
    delivery_days: s.delivery_days,
    icon: s.icon,
    color: s.color,
    is_active: s.is_active,
    display_order: s.display_order,
  }));

  if (activeBudget) {
    return (
      <BudgetEditor
        client={client}
        budget={activeBudget}
        onBack={() => setActiveBudget(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{client.name}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
              {client.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {client.company}
                </span>
              )}
              {client.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {client.email}
                </span>
              )}
              {client.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {client.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "budgets" | "services")}>
        <TabsList>
          <TabsTrigger value="budgets">
            <FileText className="w-4 h-4 mr-2" />
            Orçamentos
          </TabsTrigger>
          <TabsTrigger value="services">
            <Wrench className="w-4 h-4 mr-2" />
            Serviços do cliente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="mt-6">
          <BudgetsList client={client} onOpenBudget={setActiveBudget} />
        </TabsContent>

        <TabsContent value="services" className="mt-6 space-y-6">
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsCalcOpen(true)}
              disabled={services.length === 0}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculadora rápida
            </Button>
            <Button variant="outline" onClick={() => setIsTemplateOpen(true)}>
              <LibraryBig className="w-4 h-4 mr-2" />
              Adicionar do template
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo serviço
            </Button>
          </div>


      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando serviços...</div>
      ) : services.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <p className="text-muted-foreground mb-4">
            Este cliente ainda não tem serviços. Copie de um template ou crie um novo.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setIsTemplateOpen(true)}>
              <LibraryBig className="w-4 h-4 mr-2" />
              Do template
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo serviço
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {categoryOrder
            .filter((cat) => grouped[cat] && grouped[cat].length > 0)
            .map((cat) => (
              <div key={cat}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  {categoryNames[cat] || cat}
                  <Badge variant="secondary">{grouped[cat].length}</Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[cat].map((s) => {
                    const I = (Icons as any)[s.icon || "Folder"] || Icons.Folder;
                    return (
                      <Card
                        key={s.id}
                        className="p-4 border-2 flex flex-col h-full"
                        style={{
                          borderColor: s.color || "#6366f1",
                          opacity: s.is_active ? 1 : 0.5,
                        }}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className="p-3 rounded-lg shrink-0"
                            style={{ backgroundColor: `${s.color}20` }}
                          >
                            <I
                              className="w-6 h-6"
                              style={{ color: s.color || "#6366f1" }}
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <h4 className="font-semibold truncate">{s.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                              {s.description || ""}
                            </p>
                            <div className="flex items-center gap-4 text-sm mt-auto">
                              <div className="flex items-center gap-1 text-primary font-semibold">
                                <DollarSign className="w-4 h-4" />
                                R$ {s.price.toFixed(2)}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {s.delivery_days}d
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setEditing(s);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Remover "${s.name}" deste cliente?`)) {
                                del.mutate(s.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar serviço" : "Novo serviço"} — {client.name}
            </DialogTitle>
          </DialogHeader>
          <ClientServiceForm
            clientId={client.id}
            service={editing}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar do template — {client.name}</DialogTitle>
          </DialogHeader>
          <AddFromTemplateDialog
            clientId={client.id}
            onClose={() => setIsTemplateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCalcOpen} onOpenChange={setIsCalcOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Calculadora — {client.name}</DialogTitle>
          </DialogHeader>
          <BudgetCalculator services={calcServices} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientServicesView;
