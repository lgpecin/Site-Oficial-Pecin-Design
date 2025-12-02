import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ColorOption {
  name: string;
  value: string;
  hsl: string;
}

const primaryColors: ColorOption[] = [
  { name: "Verde Escuro", value: "#2d7a5a", hsl: "162 48% 33%" },
  { name: "Azul", value: "#3b82f6", hsl: "221 83% 53%" },
  { name: "Roxo", value: "#8b5cf6", hsl: "258 90% 66%" },
  { name: "Rosa", value: "#ec4899", hsl: "330 81% 60%" },
  { name: "Laranja", value: "#f97316", hsl: "25 95% 53%" },
  { name: "Vermelho", value: "#ef4444", hsl: "0 84% 60%" },
  { name: "Amarelo", value: "#eab308", hsl: "48 96% 53%" },
  { name: "Ciano", value: "#06b6d4", hsl: "189 94% 43%" },
];

const ColorPicker = () => {
  const [selectedPrimary, setSelectedPrimary] = useState<string>("162 48% 33%");

  useEffect(() => {
    // Load saved color from localStorage
    const savedColor = localStorage.getItem("theme-primary-color");
    if (savedColor) {
      setSelectedPrimary(savedColor);
      applyColor(savedColor);
    }
  }, []);

  const applyColor = (hsl: string) => {
    // Update CSS variables
    document.documentElement.style.setProperty("--primary", hsl);
    
    // Calculate lighter variants for other uses
    const [h, s, l] = hsl.split(" ");
    const lighterL = Math.min(parseInt(l) + 10, 95);
    document.documentElement.style.setProperty("--primary-foreground", `${h} ${s} ${lighterL}%`);
  };

  const handleColorSelect = (hsl: string, name: string) => {
    setSelectedPrimary(hsl);
    applyColor(hsl);
    localStorage.setItem("theme-primary-color", hsl);
    toast.success(`Cor primária alterada para ${name}`);
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Paleta de Cores
            </CardTitle>
            <CardDescription className="mt-1">
              Escolha a cor primária do tema
            </CardDescription>
          </div>
          <Badge variant="secondary">Personalização</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-4 block">
            Cor Primária
          </Label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {primaryColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.hsl, color.name)}
                className="group relative aspect-square rounded-lg overflow-hidden border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: color.value,
                  borderColor: selectedPrimary === color.hsl ? "white" : "transparent",
                }}
                title={color.name}
              >
                {selectedPrimary === color.hsl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Check className="h-6 w-6 text-white drop-shadow-lg" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg border-2 border-white shadow-lg"
              style={{
                backgroundColor: primaryColors.find((c) => c.hsl === selectedPrimary)?.value,
              }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">
                Cor Atual: {primaryColors.find((c) => c.hsl === selectedPrimary)?.name || "Verde Escuro"}
              </p>
              <p className="text-xs text-muted-foreground">
                HSL: {selectedPrimary}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium">Preview</Label>
          <div className="flex gap-2 flex-wrap">
            <div className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
              Botão Primário
            </div>
            <div className="px-4 py-2 border-2 border-primary text-primary rounded-lg font-medium">
              Botão Secundário
            </div>
            <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium">
              Badge
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorPicker;
