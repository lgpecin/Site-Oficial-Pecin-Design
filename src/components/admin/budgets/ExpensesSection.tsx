import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, TrendingUp, Wallet, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type Expense = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description: string | null;
  amount: number;
  recurrence: "monthly" | "yearly" | "one_time" | string;
  display_order: number;
};

const CATEGORIES = [
  { value: "equipamento", label: "Equipamento" },
  { value: "software", label: "Software / Assinatura" },
  { value: "plataforma", label: "Plataforma" },
  { value: "curso", label: "Curso / Educação" },
  { value: "servico", label: "Serviço" },
  { value: "outros", label: "Outros" },
];

const RECURRENCES = [
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
  { value: "one_time", label: "Único" },
];

const OVERHEAD_KEY = "budget_overhead_amount";

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ExpensesSection = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Expense | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["business-expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_expenses")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Expense[];
    },
  });

  const { data: overhead = 0 } = useQuery({
    queryKey: ["site-setting", OVERHEAD_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", OVERHEAD_KEY)
        .maybeSingle();
      if (error) throw error;
      return parseFloat(data?.setting_value || "0") || 0;
    },
  });

  const [overheadDraft, setOverheadDraft] = useState<string>("");

  const saveOverhead = useMutation({
    mutationFn: async (value: number) => {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("setting_key", OVERHEAD_KEY)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ setting_value: String(value) })
          .eq("setting_key", OVERHEAD_KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert([
          {
            setting_key: OVERHEAD_KEY,
            setting_value: String(value),
            setting_type: "number",
            description: "Valor a somar em cada orçamento para cobrir custos",
          },
        ]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-setting", OVERHEAD_KEY] });
      toast.success("Valor de rateio salvo");
    },
    onError: () => toast.error("Erro ao salvar valor"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("business_expenses")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business-expenses"] });
      toast.success("Custo removido");
    },
    onError: () => toast.error("Erro ao remover"),
  });

  // Totais normalizados para mensal
  const monthlyTotal = expenses.reduce((sum, e) => {
    if (e.recurrence === "monthly") return sum + Number(e.amount);
    if (e.recurrence === "yearly") return sum + Number(e.amount) / 12;
    return sum;
  }, 0);
  const yearlyTotal = monthlyTotal * 12;
  const oneTimeTotal = expenses
    .filter((e) => e.recurrence === "one_time")
    .reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Custos do Negócio</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre equipamentos, assinaturas e outros gastos. Configure quanto
            somar em cada orçamento para cobrir esses custos.
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Custo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar Custo" : "Novo Custo"}
              </DialogTitle>
            </DialogHeader>
            <ExpenseForm
              expense={editing}
              userId={user?.id || ""}
              onClose={() => {
                setDialogOpen(false);
                setEditing(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
            <TrendingUp className="w-3.5 h-3.5" />
            Total Mensal
          </div>
          <div className="text-2xl font-bold mt-1">{fmt(monthlyTotal)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Recorrências mensais + anuais/12
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
            <TrendingUp className="w-3.5 h-3.5" />
            Total Anual
          </div>
          <div className="text-2xl font-bold mt-1">{fmt(yearlyTotal)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Projeção baseada no mensal
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
            <Wallet className="w-3.5 h-3.5" />
            Investimentos Únicos
          </div>
          <div className="text-2xl font-bold mt-1">{fmt(oneTimeTotal)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Compras pontuais registradas
          </div>
        </Card>
      </div>

      {/* Rateio por orçamento */}
      <Card className="p-4 border-primary/40">
        <div className="flex items-start gap-2 mb-3">
          <Info className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold">Rateio por Orçamento</h3>
            <p className="text-xs text-muted-foreground">
              Defina um valor fixo (R$) para somar em cada orçamento e ajudar a
              cobrir seus custos. Use como referência ao montar propostas.
            </p>
          </div>
        </div>
        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <Label className="text-xs">Valor a aplicar por orçamento (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder={String(overhead)}
              value={overheadDraft}
              onChange={(e) => setOverheadDraft(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              const v = parseFloat(overheadDraft.replace(",", ".")) || 0;
              saveOverhead.mutate(v);
              setOverheadDraft("");
            }}
            disabled={saveOverhead.isPending}
          >
            Salvar
          </Button>
          <div className="text-sm">
            Atual:{" "}
            <span className="font-semibold text-primary">{fmt(overhead)}</span>
          </div>
        </div>
        {monthlyTotal > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Sugestão: se você fecha ~4 orçamentos/mês, aplique cerca de{" "}
            <strong>{fmt(monthlyTotal / 4)}</strong> em cada.
          </p>
        )}
      </Card>

      {/* Lista */}
      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : expenses.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            Nenhum custo cadastrado. Clique em "Novo Custo" para começar.
          </Card>
        ) : (
          expenses.map((e) => (
            <Card key={e.id} className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{e.name}</span>
                  <span className="text-[10px] uppercase tracking-wide bg-muted px-2 py-0.5 rounded">
                    {CATEGORIES.find((c) => c.value === e.category)?.label ||
                      e.category}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {RECURRENCES.find((r) => r.value === e.recurrence)?.label ||
                      e.recurrence}
                  </span>
                </div>
                {e.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {e.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold">{fmt(Number(e.amount))}</div>
                {e.recurrence === "yearly" && (
                  <div className="text-[10px] text-muted-foreground">
                    ≈ {fmt(Number(e.amount) / 12)}/mês
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(e);
                    setDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Remover "${e.name}"?`)) remove.mutate(e.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const ExpenseForm = ({
  expense,
  userId,
  onClose,
}: {
  expense: Expense | null;
  userId: string;
  onClose: () => void;
}) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: expense?.name || "",
    category: expense?.category || "outros",
    description: expense?.description || "",
    amount: expense?.amount != null ? String(expense.amount) : "",
    recurrence: expense?.recurrence || "monthly",
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || null,
        amount: parseFloat(form.amount.replace(",", ".")) || 0,
        recurrence: form.recurrence,
      };
      if (!payload.name) throw new Error("Nome obrigatório");
      if (expense) {
        const { error } = await supabase
          .from("business_expenses")
          .update(payload)
          .eq("id", expense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("business_expenses")
          .insert([{ ...payload, user_id: userId }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business-expenses"] });
      toast.success(expense ? "Custo atualizado" : "Custo adicionado");
      onClose();
    },
    onError: (e: any) => toast.error(e.message || "Erro ao salvar"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-3"
    >
      <div>
        <Label>Nome</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ex: Adobe Creative Cloud"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Categoria</Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Recorrência</Label>
          <Select
            value={form.recurrence}
            onValueChange={(v) => setForm({ ...form, recurrence: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRENCES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Valor (R$)</Label>
        <Input
          type="text"
          inputMode="decimal"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="Ex: 89,90"
          required
        />
      </div>
      <div>
        <Label>Descrição (opcional)</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={save.isPending}>
          {save.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};

export default ExpensesSection;
