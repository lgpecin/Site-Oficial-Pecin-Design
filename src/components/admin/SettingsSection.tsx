import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, Settings } from "lucide-react";

interface Setting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  description: string | null;
}

const SettingsSection = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("setting_key");

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.setting_key === key
          ? { ...setting, setting_value: value }
          : setting
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = settings.map(setting => ({
        id: setting.id,
        setting_value: setting.setting_value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .update({ setting_value: update.setting_value })
          .eq("id", update.id);

        if (error) throw error;
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (setting: Setting) => {
    const value = setting.setting_value || "";

    switch (setting.setting_type) {
      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            placeholder={setting.description || ""}
            rows={3}
          />
        );
      case "email":
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            placeholder={setting.description || ""}
          />
        );
      case "url":
        return (
          <Input
            type="url"
            value={value}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            placeholder={setting.description || ""}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            placeholder={setting.description || ""}
          />
        );
    }
  };

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      whatsapp_number: "Número do WhatsApp",
      whatsapp_message: "Mensagem do WhatsApp",
      instagram_url: "Link do Instagram",
      linkedin_url: "Link do LinkedIn",
      behance_url: "Link do Behance",
      site_email: "Email de Contato",
      site_phone: "Telefone de Contato",
      site_title: "Título do Site",
      site_description: "Descrição do Site",
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Configurações do Site
          </h2>
          <p className="text-muted-foreground mt-2">
            Gerencie links e informações do seu portfólio
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Redes Sociais</CardTitle>
            <CardDescription>
              Configure os links das suas redes sociais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings
              .filter((s) =>
                ["instagram_url", "linkedin_url", "behance_url"].includes(
                  s.setting_key
                )
              )
              .map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key}>
                    {getSettingLabel(setting.setting_key)}
                  </Label>
                  {renderInput(setting)}
                  {setting.description && (
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>
              Configure o botão de WhatsApp do site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings
              .filter((s) =>
                ["whatsapp_number", "whatsapp_message"].includes(s.setting_key)
              )
              .map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key}>
                    {getSettingLabel(setting.setting_key)}
                  </Label>
                  {renderInput(setting)}
                  {setting.description && (
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
            <CardDescription>
              Informações de contato do site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings
              .filter((s) =>
                ["site_email", "site_phone"].includes(s.setting_key)
              )
              .map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key}>
                    {getSettingLabel(setting.setting_key)}
                  </Label>
                  {renderInput(setting)}
                  {setting.description && (
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
            <CardDescription>
              Título e descrição do seu portfólio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings
              .filter((s) =>
                ["site_title", "site_description"].includes(s.setting_key)
              )
              .map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key}>
                    {getSettingLabel(setting.setting_key)}
                  </Label>
                  {renderInput(setting)}
                  {setting.description && (
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsSection;