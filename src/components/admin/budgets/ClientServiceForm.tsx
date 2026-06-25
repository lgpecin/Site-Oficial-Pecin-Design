import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import HoursPricingHelper from "./HoursPricingHelper";
import type { ClientService } from "./types";

const categories = [
  { value: "estatico", label: "Estático" },
  { value: "carrossel", label: "Carrossel" },
  { value: "reels", label: "Reels" },
  { value: "branding", label: "Branding" },
  { value: "marca", label: "Marca" },
  { value: "ebook", label: "E-book" },
  { value: "outros", label: "Outros" },
];

const iconOptions = [
  "Image", "Images", "LayoutGrid", "Video", "Clapperboard",
  "Palette", "Star", "BookOpen", "FileText", "Folder",
  "Pen", "Pencil", "Brush", "Sparkles", "Lightbulb",
];

const colorOptions = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444",
  "#10b981", "#3b82f6", "#14b8a6", "#a855f7", "#f97316",
];

type Props = {
  clientId: string;
  service: ClientService | null;
  onClose: () => void;
};

const ClientServiceForm = ({ clientId, service, onClose }: Props) => {
  const [form, setForm] = useState({
    name: service?.name || "",
    description: service?.description || "",
    category: service?.category || "estatico",
    price: service?.price ?? 0,
    delivery_days: service?.delivery_days ?? 1,
    hours: service?.hours ?? 0,
    icon: service?.icon || "Folder",
    color: service?.color || "#6366f1",
    is_active: service?.is_active ?? true,
  });
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: async () => {
      if (service) {
        const { error } = await supabase
          .from("client_services")
          .update(form)
          .eq("id", service.id);
        if (error) throw error;
      } else {
        const { data: maxOrder } = await supabase
          .from("client_services")
          .select("display_order")
          .eq("client_id", clientId)
          .order("display_order", { ascending: false })
          .limit(1);
        const nextOrder =
          maxOrder && maxOrder.length > 0 ? (maxOrder[0].display_order || 0) + 1 : 0;
        const { error } = await supabase
          .from("client_services")
          .insert([{ ...form, client_id: clientId, display_order: nextOrder }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["client_services", clientId] });
      qc.invalidateQueries({ queryKey: ["client_services_counts"] });
      toast.success(service ? "Serviço atualizado" : "Serviço criado");
      onClose();
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao salvar"),
  });

  const SelectedIcon = (Icons as any)[form.icon] || Icons.Folder;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="cs-name">Nome do serviço</Label>
        <Input
          id="cs-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="cs-desc">Descrição</Label>
        <Textarea
          id="cs-desc"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="cs-price">Preço (R$)</Label>
          <Input
            id="cs-price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="cs-days">Prazo (dias úteis)</Label>
        <Input
          id="cs-days"
          type="number"
          value={form.delivery_days}
          onChange={(e) => setForm({ ...form, delivery_days: parseInt(e.target.value) || 1 })}
          required
        />
      </div>

      <HoursPricingHelper
        hours={form.hours}
        onHoursChange={(h) => setForm({ ...form, hours: h })}
        onApplySuggested={(p) => setForm({ ...form, price: p })}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ícone</Label>
          <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((icon) => {
                const I = (Icons as any)[icon];
                return (
                  <SelectItem key={icon} value={icon}>
                    <div className="flex items-center gap-2">
                      <I className="w-4 h-4" />
                      {icon}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <SelectedIcon className="w-5 h-5" style={{ color: form.color }} />
            Preview
          </div>
        </div>
        <div>
          <Label>Cor</Label>
          <div className="flex gap-2 flex-wrap mt-2">
            {colorOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className={`w-8 h-8 rounded-full border-2 ${
                  form.color === c ? "border-foreground" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="cs-active">Serviço ativo</Label>
        <Switch
          id="cs-active"
          checked={form.is_active}
          onCheckedChange={(v) => setForm({ ...form, is_active: v })}
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

export default ClientServiceForm;
