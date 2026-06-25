import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KEY = "hourly_rate";

export const useHourlyRate = () => {
  const qc = useQueryClient();

  const { data: hourlyRate = 0, isLoading } = useQuery({
    queryKey: ["site-setting", KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", KEY)
        .maybeSingle();
      if (error) throw error;
      return parseFloat(data?.setting_value || "0") || 0;
    },
    staleTime: 60_000,
  });

  const save = useMutation({
    mutationFn: async (value: number) => {
      // try update first
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("setting_key", KEY)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ setting_value: String(value) })
          .eq("setting_key", KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert([{ setting_key: KEY, setting_value: String(value), setting_type: "number", description: "Valor cobrado por hora (R$)" }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-setting", KEY] });
      toast.success("Valor/hora atualizado");
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao salvar valor/hora"),
  });

  return { hourlyRate, isLoading, setHourlyRate: (v: number) => save.mutate(v) };
};
