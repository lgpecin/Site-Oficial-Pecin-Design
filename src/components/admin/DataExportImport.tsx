import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRef } from "react";

type DataExportImportProps = {
  tableName: string;
  buttonLabel?: string;
  onImportSuccess?: () => void;
};

const DataExportImport = ({ 
  tableName, 
  buttonLabel = "Dados",
  onImportSuccess 
}: DataExportImportProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*");

      if (error) throw error;

      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${tableName}_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup exportado!",
        description: `Arquivo ${tableName}.json baixado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error("Formato de arquivo inválido");
      }

      // Remove ids para evitar conflitos
      const dataToInsert = data.map(({ id, created_at, updated_at, ...rest }) => rest);

      const { error } = await supabase
        .from(tableName as any)
        .insert(dataToInsert);

      if (error) throw error;

      toast({
        title: "Dados importados!",
        description: `${data.length} registro(s) importado(s) com sucesso.`,
      });

      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: "Não foi possível importar os dados. Verifique o formato do arquivo.",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="w-4 h-4 mr-2" />
        Exportar {buttonLabel}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-4 h-4 mr-2" />
        Importar {buttonLabel}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
};

export default DataExportImport;
