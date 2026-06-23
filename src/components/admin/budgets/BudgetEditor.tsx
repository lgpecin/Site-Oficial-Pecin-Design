import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileDown,
  Save,
  LibraryBig,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import type { BudgetClient, ClientBudget, BudgetItem, ClientService } from "./types";

type Props = {
  client: BudgetClient;
  budget: ClientBudget;
  onBack: () => void;
};

const GROUP_COLORS = [
  { label: "Verde", value: "#84cc16" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Rosa", value: "#ec4899" },
  { label: "Azul", value: "#3b82f6" },
  { label: "Roxo", value: "#8b5cf6" },
  { label: "Laranja", value: "#f97316" },
  { label: "Amarelo", value: "#eab308" },
];

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const BudgetEditor = ({ client, budget, onBack }: Props) => {
  const qc = useQueryClient();
  const [meta, setMeta] = useState({
    name: budget.name,
    status: budget.status,
    start_date: budget.start_date || "",
    discount_type: (budget.discount_type as "none" | "value" | "percent") || "none",
    discount_value: Number(budget.discount_value) || 0,
    notes: budget.notes || "",
  });
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["budget_items", budget.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_items")
        .select("*")
        .eq("budget_id", budget.id)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as BudgetItem[];
    },
  });

  const { data: clientServices = [] } = useQuery({
    queryKey: ["client_services", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_services")
        .select("*")
        .eq("client_id", client.id)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as ClientService[];
    },
  });

  const [draft, setDraft] = useState<BudgetItem[]>([]);
  useEffect(() => setDraft(items), [items]);

  const updateItem = (id: string, patch: Partial<BudgetItem>) => {
    setDraft((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };
  const removeItem = (id: string) => setDraft((prev) => prev.filter((i) => i.id !== id));

  const addEmpty = (groupLabel?: string, groupColor?: string) => {
    const nextOrder =
      draft.reduce((m, i) => Math.max(m, i.display_order), 0) + 1;
    const tmp: BudgetItem = {
      id: `tmp-${crypto.randomUUID()}`,
      budget_id: budget.id,
      client_service_id: null,
      name: "Novo item",
      description: "",
      price: 0,
      delivery_days: 1,
      quantity: 1,
      group_label: groupLabel || null,
      group_color: groupColor || null,
      display_order: nextOrder,
      created_at: new Date().toISOString(),
    };
    setDraft((prev) => [...prev, tmp]);
  };

  const addFromService = (svc: ClientService, groupLabel?: string, groupColor?: string) => {
    const nextOrder = draft.reduce((m, i) => Math.max(m, i.display_order), 0) + 1;
    const tmp: BudgetItem = {
      id: `tmp-${crypto.randomUUID()}`,
      budget_id: budget.id,
      client_service_id: svc.id,
      name: svc.name,
      description: svc.description || "",
      price: svc.price,
      delivery_days: svc.delivery_days,
      quantity: 1,
      group_label: groupLabel || null,
      group_color: groupColor || svc.color || null,
      display_order: nextOrder,
      created_at: new Date().toISOString(),
    };
    setDraft((prev) => [...prev, tmp]);
  };

  const save = useMutation({
    mutationFn: async () => {
      const { error: mErr } = await supabase
        .from("client_budgets")
        .update({
          name: meta.name,
          status: meta.status,
          start_date: meta.start_date || null,
          discount_type: meta.discount_type,
          discount_value: meta.discount_value,
          notes: meta.notes,
        })
        .eq("id", budget.id);
      if (mErr) throw mErr;

      // Delete removed
      const existingIds = items.map((i) => i.id);
      const draftIds = draft.filter((d) => !d.id.startsWith("tmp-")).map((d) => d.id);
      const toDelete = existingIds.filter((id) => !draftIds.includes(id));
      if (toDelete.length) {
        const { error } = await supabase.from("budget_items").delete().in("id", toDelete);
        if (error) throw error;
      }

      // Upsert
      const toInsert = draft
        .filter((d) => d.id.startsWith("tmp-"))
        .map((d, idx) => ({
          budget_id: budget.id,
          client_service_id: d.client_service_id,
          name: d.name,
          description: d.description,
          price: d.price,
          delivery_days: d.delivery_days,
          quantity: d.quantity,
          group_label: d.group_label,
          group_color: d.group_color,
          display_order: d.display_order || idx,
        }));
      if (toInsert.length) {
        const { error } = await supabase.from("budget_items").insert(toInsert);
        if (error) throw error;
      }

      const toUpdate = draft.filter((d) => !d.id.startsWith("tmp-"));
      for (const d of toUpdate) {
        const { error } = await supabase
          .from("budget_items")
          .update({
            name: d.name,
            description: d.description,
            price: d.price,
            delivery_days: d.delivery_days,
            quantity: d.quantity,
            group_label: d.group_label,
            group_color: d.group_color,
            display_order: d.display_order,
          })
          .eq("id", d.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget_items", budget.id] });
      qc.invalidateQueries({ queryKey: ["client_budgets", client.id] });
      toast.success("Orçamento salvo");
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao salvar"),
  });

  // Grouping
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; color: string; items: BudgetItem[] }>();
    draft.forEach((it) => {
      const key = it.group_label || "__none__";
      if (!map.has(key)) {
        map.set(key, {
          label: it.group_label || "Sem grupo",
          color: it.group_color || "#84cc16",
          items: [],
        });
      }
      map.get(key)!.items.push(it);
    });
    return Array.from(map.values());
  }, [draft]);

  const subtotal = draft.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount =
    meta.discount_type === "percent"
      ? (subtotal * Math.max(0, Math.min(100, meta.discount_value))) / 100
      : meta.discount_type === "value"
      ? Math.max(0, meta.discount_value)
      : 0;
  const total = Math.max(0, subtotal - discount);
  const totalDays = draft.reduce((s, i) => s + i.delivery_days, 0);

  // ============ PDF EXPORT ============
  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const BAND_W = 56;
    const BAND_COLOR: [number, number, number] = [132, 204, 22]; // lime green
    const TEXT_DARK: [number, number, number] = [15, 15, 15];
    const PRICE_GREEN: [number, number, number] = [22, 101, 52];
    const MUTED: [number, number, number] = [110, 110, 110];

    const drawHeader = () => {
      // left lime band
      doc.setFillColor(...BAND_COLOR);
      doc.rect(0, 0, BAND_W, pageH, "F");

      // Pec/n des/gh logo
      const lx = BAND_W + 40;
      const ly = 60;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...TEXT_DARK);
      doc.text("Pec/n", lx, ly);
      doc.text("des/gh", lx, ly + 22);
      // accent strokes on the slashes — approximate
      doc.setDrawColor(...BAND_COLOR);
      doc.setLineWidth(2);
      doc.line(lx + 40, ly + 4, lx + 50, ly - 12);
    };

    // ============ PAGE 1: Etapas & Prazos ============
    drawHeader();
    let y = 170;
    const cx = BAND_W + 40;
    const rightX = pageW - 40;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(34);
    doc.setTextColor(...TEXT_DARK);
    doc.text("3. Etapas", cx, y);
    y += 36;
    doc.text("    & Prazos.", cx, y);
    y += 50;

    let groupIdx = 0;
    groups.forEach((g) => {
      groupIdx++;
      // group title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...TEXT_DARK);
      const title = `${groupIdx} - ${g.label}`;
      doc.text(title, cx, y);
      // accent label (project tag) in group color
      const titleW = doc.getTextWidth(title);
      const r = parseInt((g.color || "#84cc16").slice(1, 3), 16);
      const gg = parseInt((g.color || "#84cc16").slice(3, 5), 16);
      const bb = parseInt((g.color || "#84cc16").slice(5, 7), 16);
      doc.setTextColor(r, gg, bb);
      doc.text(g.label === "Sem grupo" ? "" : "", cx + titleW + 6, y);
      y += 18;

      // items
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      g.items.forEach((it, idx) => {
        if (y > pageH - 140) {
          doc.addPage();
          drawHeader();
          y = 80;
        }
        doc.setTextColor(...TEXT_DARK);
        const numbering = `${groupIdx}.${idx + 1} - ${it.name}`;
        doc.text(numbering, cx, y);
        const days = `${it.delivery_days} ${it.delivery_days === 1 ? "dia útil" : "dias úteis"}`;
        doc.text(days, rightX, y, { align: "right" });
        y += 16;
      });
      y += 14;
    });

    // Total row at bottom
    const footY = pageH - 110;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...TEXT_DARK);
    doc.text("Prazo total", cx, footY);
    doc.text(`${totalDays} ${totalDays === 1 ? "dia útil" : "dias úteis"}`, rightX, footY, {
      align: "right",
    });
    doc.text("Disponibilidade para início", cx, footY + 20);
    const startStr = meta.start_date
      ? new Date(meta.start_date + "T00:00:00").toLocaleDateString("pt-BR")
      : "—";
    doc.text(startStr, rightX, footY + 20, { align: "right" });

    // bottom divider
    doc.setDrawColor(...TEXT_DARK);
    doc.setLineWidth(0.8);
    doc.line(pageW / 2 - 50, pageH - 50, pageW / 2 + 50, pageH - 50);

    // ============ PAGE 2: Investimento ============
    doc.addPage();
    drawHeader();

    // Group color bands on the left (per group)
    let bandY = 200;
    const bandW = 28;
    const bandX = BAND_W;

    y = 170;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(34);
    doc.setTextColor(...TEXT_DARK);
    doc.text("5. Investimento.", cx, y);
    y += 50;

    groupIdx = 0;
    groups.forEach((g) => {
      groupIdx++;
      const groupStartY = y - 14;

      // color band with rotated label
      const r = parseInt((g.color || "#84cc16").slice(1, 3), 16);
      const gg = parseInt((g.color || "#84cc16").slice(3, 5), 16);
      const bb = parseInt((g.color || "#84cc16").slice(5, 7), 16);

      const itemsBlockHeight = g.items.reduce((h, it) => {
        const descLines = it.description
          ? doc.splitTextToSize(it.description, pageW - cx - 60).length
          : 0;
        return h + 22 + 16 + descLines * 13 + 14;
      }, 0);

      doc.setFillColor(r, gg, bb);
      doc.rect(bandX, groupStartY, bandW, itemsBlockHeight + 10, "F");
      // label rotated
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(
        g.label,
        bandX + bandW / 2 + 4,
        groupStartY + itemsBlockHeight / 2 + 20,
        { angle: 90 }
      );

      g.items.forEach((it, idx) => {
        if (y > pageH - 120) {
          doc.addPage();
          drawHeader();
          y = 80;
        }
        // title: "0X. Name: R$ XXX"
        const num = String(idx + 1).padStart(2, "0");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...TEXT_DARK);
        const titleText = `${num}. ${it.name}:`;
        doc.text(titleText, cx, y);
        const titleW = doc.getTextWidth(titleText);
        doc.setTextColor(...PRICE_GREEN);
        doc.text(` ${formatBRL(it.price * it.quantity)}`, cx + titleW + 2, y);
        y += 18;

        // description bold subtitle (first part) and incluso text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...TEXT_DARK);
        if (it.description) {
          const lines = doc.splitTextToSize(it.description, pageW - cx - 60);
          lines.forEach((line: string) => {
            doc.text(line, cx, y);
            y += 13;
          });
        }
        y += 12;
      });
      y += 4;
    });

    // Totals
    if (y > pageH - 140) {
      doc.addPage();
      drawHeader();
      y = 100;
    }
    y += 10;
    doc.setDrawColor(200);
    doc.line(cx, y, rightX, y);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text("Subtotal", cx, y);
    doc.setTextColor(...TEXT_DARK);
    doc.text(formatBRL(subtotal), rightX, y, { align: "right" });
    y += 16;

    if (discount > 0) {
      doc.setTextColor(...MUTED);
      const dLabel =
        meta.discount_type === "percent"
          ? `Desconto (${meta.discount_value}%)`
          : "Desconto";
      doc.text(dLabel, cx, y);
      doc.setTextColor(200, 50, 50);
      doc.text(`- ${formatBRL(discount)}`, rightX, y, { align: "right" });
      y += 16;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...TEXT_DARK);
    doc.text("Total", cx, y + 10);
    doc.setTextColor(...PRICE_GREEN);
    doc.text(formatBRL(total), rightX, y + 10, { align: "right" });

    // bottom divider
    doc.setDrawColor(...TEXT_DARK);
    doc.setLineWidth(0.8);
    doc.line(pageW / 2 - 50, pageH - 50, pageW / 2 + 50, pageH - 50);

    doc.save(`${meta.name || "orcamento"}-${client.name}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <Input
              value={meta.name}
              onChange={(e) => setMeta({ ...meta, name: e.target.value })}
              className="text-xl font-bold border-0 px-0 h-auto focus-visible:ring-0"
            />
            <p className="text-xs text-muted-foreground">{client.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF} disabled={draft.length === 0}>
            <FileDown className="w-4 h-4 mr-1" />
            Exportar PDF
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            <Save className="w-4 h-4 mr-1" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Meta */}
      <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Status</Label>
          <Select value={meta.status} onValueChange={(v) => setMeta({ ...meta, status: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Recusado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Disponibilidade para início</Label>
          <Input
            type="date"
            value={meta.start_date}
            onChange={(e) => setMeta({ ...meta, start_date: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Desconto</Label>
            <Select
              value={meta.discount_type}
              onValueChange={(v: any) => setMeta({ ...meta, discount_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="value">R$ valor</SelectItem>
                <SelectItem value="percent">% percentual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>&nbsp;</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              disabled={meta.discount_type === "none"}
              value={meta.discount_value}
              onChange={(e) =>
                setMeta({ ...meta, discount_value: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>
      </Card>

      {/* Items */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Itens do orçamento</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTemplateOpen(true)}
            disabled={clientServices.length === 0}
          >
            <LibraryBig className="w-4 h-4 mr-1" />
            Adicionar do serviço
          </Button>
          <Button size="sm" onClick={() => addEmpty()}>
            <Plus className="w-4 h-4 mr-1" />
            Bloco vazio
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-6">Carregando...</div>
      ) : draft.length === 0 ? (
        <Card className="p-8 text-center border-dashed text-muted-foreground">
          Adicione blocos com os serviços deste orçamento.
        </Card>
      ) : (
        <div className="space-y-3">
          {draft.map((it) => (
            <Card key={it.id} className="p-4 border-l-4" style={{ borderLeftColor: it.group_color || "#cbd5e1" }}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                <div className="md:col-span-4">
                  <Label className="text-xs">Nome do item</Label>
                  <Input
                    value={it.name}
                    onChange={(e) => updateItem(it.id, { name: e.target.value })}
                  />
                </div>
                <div className="md:col-span-3">
                  <Label className="text-xs">Grupo (ex: Have Fun)</Label>
                  <Input
                    value={it.group_label || ""}
                    placeholder="Sem grupo"
                    onChange={(e) =>
                      updateItem(it.id, { group_label: e.target.value || null })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Cor do grupo</Label>
                  <Select
                    value={it.group_color || "#84cc16"}
                    onValueChange={(v) => updateItem(it.id, { group_color: v })}
                  >
                    <SelectTrigger>
                      <div
                        className="w-4 h-4 rounded mr-1 inline-block"
                        style={{ backgroundColor: it.group_color || "#84cc16" }}
                      />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUP_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: c.value }}
                            />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Label className="text-xs">Qtd</Label>
                  <Input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(it.id, { quantity: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="md:col-span-1">
                  <Label className="text-xs">Dias</Label>
                  <Input
                    type="number"
                    min={0}
                    value={it.delivery_days}
                    onChange={(e) =>
                      updateItem(it.id, { delivery_days: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="md:col-span-1">
                  <Label className="text-xs">Preço</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={it.price}
                    onChange={(e) =>
                      updateItem(it.id, { price: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="md:col-span-12">
                  <Label className="text-xs">Descrição (aparece no PDF)</Label>
                  <Textarea
                    rows={2}
                    value={it.description || ""}
                    onChange={(e) => updateItem(it.id, { description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  Subtotal: <strong className="text-primary">{formatBRL(it.price * it.quantity)}</strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(it.id)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Totals */}
      <Card className="p-5 bg-muted/30 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatBRL(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-destructive">
            <span>
              Desconto{" "}
              {meta.discount_type === "percent" ? `(${meta.discount_value}%)` : ""}
            </span>
            <span>- {formatBRL(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Prazo total</span>
          <span>
            {totalDays} {totalDays === 1 ? "dia útil" : "dias úteis"}
          </span>
        </div>
        <div className="flex justify-between text-xl font-bold border-t pt-2">
          <span>Total</span>
          <span className="text-primary">{formatBRL(total)}</span>
        </div>
      </Card>

      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar do serviço do cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {clientServices.map((s) => (
              <Card
                key={s.id}
                className="p-3 flex items-center justify-between hover:bg-muted cursor-pointer"
                onClick={() => {
                  addFromService(s);
                  setIsTemplateOpen(false);
                }}
              >
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatBRL(s.price)} · {s.delivery_days}d
                  </div>
                </div>
                <Plus className="w-4 h-4" />
              </Card>
            ))}
            {clientServices.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                Nenhum serviço cadastrado para este cliente.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetEditor;
