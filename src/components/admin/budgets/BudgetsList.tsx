import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, FileText, Trash2, ArrowRight, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { BudgetClient, ClientBudget } from "./types";

type Props = {
  client: BudgetClient;
  onOpenBudget: (budget: ClientBudget) => void;
};

const BudgetsList = ({ client, onOpenBudget }: Props) => {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const qc = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["client_budgets", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_budgets")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ClientBudget[];
    },
  });

  const create = useMutation({
    mutationFn: async (name: string) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("client_budgets")
        .insert([{ client_id: client.id, user_id: u.user.id, name }])
        .select()
        .single();
      if (error) throw error;
      return data as ClientBudget;
    },
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["client_budgets", client.id] });
      toast.success("Orçamento criado");
      setIsNewOpen(false);
      setNewName("");
      onOpenBudget(b);
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao criar orçamento"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_budgets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["client_budgets", client.id] });
      toast.success("Orçamento excluído");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Orçamentos de {client.name}</h3>
        <Button onClick={() => setIsNewOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Novo orçamento
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : budgets.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Nenhum orçamento criado ainda para este cliente.
          </p>
          <Button onClick={() => setIsNewOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Criar primeiro orçamento
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {budgets.map((b) => (
            <Card key={b.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold truncate">{b.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(b.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {b.status}
                </Badge>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Excluir orçamento "${b.name}"?`)) del.mutate(b.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" className="flex-1" onClick={() => onOpenBudget(b)}>
                  Abrir
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nome do orçamento</Label>
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Campanha de lançamento"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) create.mutate(newName.trim());
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => newName.trim() && create.mutate(newName.trim())}
              disabled={!newName.trim() || create.isPending}
            >
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetsList;
