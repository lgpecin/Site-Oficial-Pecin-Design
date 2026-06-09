import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { BudgetClient } from "./types";

type Props = {
  client: BudgetClient | null;
  onClose: () => void;
};

const ClientForm = ({ client, onClose }: Props) => {
  const [form, setForm] = useState({
    name: client?.name || "",
    company: client?.company || "",
    email: client?.email || "",
    phone: client?.phone || "",
    notes: client?.notes || "",
  });
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: async () => {
      if (client) {
        const { error } = await supabase
          .from("budget_clients")
          .update(form)
          .eq("id", client.id);
        if (error) throw error;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Não autenticado");
        const { error } = await supabase
          .from("budget_clients")
          .insert([{ ...form, user_id: userData.user.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget_clients"] });
      toast.success(client ? "Cliente atualizado" : "Cliente criado");
      onClose();
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao salvar cliente"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="notes">Anotações</Label>
        <Textarea
          id="notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={save.isPending}>
          {save.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
