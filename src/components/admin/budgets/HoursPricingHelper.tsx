import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Settings2 } from "lucide-react";
import { useHourlyRate } from "@/hooks/useHourlyRate";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  hours: number;
  onHoursChange: (h: number) => void;
  onApplySuggested: (suggested: number) => void;
};

const HoursPricingHelper = ({ hours, onHoursChange, onApplySuggested }: Props) => {
  const { hourlyRate, setHourlyRate } = useHourlyRate();
  const [draftRate, setDraftRate] = useState(hourlyRate);
  const suggested = (hours || 0) * (hourlyRate || 0);

  return (
    <div className="rounded-md border border-dashed p-3 space-y-2 bg-muted/30">
      <div className="flex items-center justify-between">
        <Label className="text-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Estimativa por hora
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Settings2 className="w-3 h-3 mr-1" />
              R$ {hourlyRate.toFixed(2)}/h
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <Label className="text-xs">Meu valor/hora (R$)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                step="0.01"
                value={draftRate}
                onChange={(e) => setDraftRate(parseFloat(e.target.value) || 0)}
              />
              <Button
                type="button"
                size="sm"
                onClick={() => setHourlyRate(draftRate)}
              >
                Salvar
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Usado para sugerir preços em todos os serviços.
            </p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-2 gap-2 items-end">
        <div>
          <Label htmlFor="hours" className="text-xs">Horas estimadas</Label>
          <Input
            id="hours"
            type="number"
            step="0.5"
            min={0}
            value={hours}
            onChange={(e) => onHoursChange(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Sugestão</span>
          <div className="flex gap-2 items-center">
            <span className="text-sm font-semibold">
              {suggested.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7"
              disabled={!suggested}
              onClick={() => onApplySuggested(suggested)}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoursPricingHelper;
