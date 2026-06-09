import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, ArrowRight, Building2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import ClientForm from "./ClientForm";
import type { BudgetClient } from "./types";

type Props = {
  onOpenClient: (client: BudgetClient) => void;
};

const ClientsList = ({ onOpenClient }: Props) => {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetClient | null>(null);
  const qc = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["budget_clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BudgetClient[];
    },
  });

  const { data: countsData = [] } = useQuery({
    queryKey: ["client_services_counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_services")
        .select("client_id");
      if (error) throw error;
      return data as { client_id: string }[];
    },
  });

  const counts = countsData.reduce<Record<string, number>>((acc, r) => {
    acc[r.client_id] = (acc[r.client_id] || 0) + 1;
    return acc;
  }, {});

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budget_clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget_clients"] });
      qc.invalidateQueries({ queryKey: ["client_services_counts"] });
      toast.success("Cliente excluído");
    },
    onError: () => toast.error("Erro ao excluir cliente"),
  });

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  const handleClose = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar cliente por nome, empresa, e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo cliente
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando clientes...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <p className="text-muted-foreground mb-4">
            {clients.length === 0
              ? "Nenhum cliente cadastrado ainda."
              : "Nenhum cliente corresponde à busca."}
          </p>
          {clients.length === 0 && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar primeiro cliente
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg truncate">{c.name}</h3>
                  {c.company && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      {c.company}
                    </div>
                  )}
                </div>
                <Badge variant="secondary">{counts[c.id] || 0} serviços</Badge>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                {c.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {c.phone}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-auto pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(c);
                    setIsFormOpen(true);
                  }}
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm(`Excluir cliente "${c.name}" e todos seus serviços?`)) {
                      del.mutate(c.id);
                    }
                  }}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" className="flex-1" onClick={() => onOpenClient(c)}>
                  Abrir
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          </DialogHeader>
          <ClientForm client={editing} onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsList;
