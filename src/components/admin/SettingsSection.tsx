import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  Save, 
  Settings, 
  MessageSquare, 
  Share2, 
  Mail, 
  Globe, 
  Search,
  Palette,
  Bell,
  Shield,
  Sparkles,
  UserCog
} from "lucide-react";
import ThemeSwitch from "./ThemeSwitch";
import ColorPicker from "./ColorPicker";
import SEOSettings from "./SEOSettings";
import UsersSection from "./UsersSection";

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            Configurações
          </h2>
          <p className="text-muted-foreground text-lg">
            Personalize e configure seu portfólio
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Mail className="h-4 w-4" />
            Contato
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" />
            Redes Sociais
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <UserCog className="h-4 w-4" />
            Usuários
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* Info Banner */}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium text-primary">
                  O que esta seção controla?
                </p>
                <p className="text-sm text-muted-foreground">
                  O <strong>Título</strong> e <strong>Descrição</strong> definidos aqui são os valores principais do seu site. 
                  Eles são usados automaticamente como padrão nas <strong>Meta Tags de SEO</strong> (aba SEO), 
                  nos compartilhamentos de redes sociais e em toda a identidade do site. 
                  Pense neles como a "apresentação oficial" do seu portfólio.
                </p>
              </div>
            </div>
          </div>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Informações do Site
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Defina o título e descrição base do seu portfólio
                  </CardDescription>
                </div>
                <Badge variant="secondary">Principal</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings
                .filter((s) =>
                  ["site_title", "site_description"].includes(s.setting_key)
                )
                .map((setting) => (
                  <div key={setting.id} className="space-y-3">
                    <Label htmlFor={setting.setting_key} className="text-base font-medium">
                      {getSettingLabel(setting.setting_key)}
                    </Label>
                    {renderInput(setting)}
                    {setting.description && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-primary">•</span>
                        {setting.description}
                      </p>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Tema da Interface
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Escolha entre tema claro, escuro ou automático
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Personalização
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ThemeSwitch />
            </CardContent>
          </Card>

          <ColorPicker />

          <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Palette className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">
                  Suas preferências são salvas automaticamente
                </p>
                <p className="text-sm text-muted-foreground">
                  O tema e as cores selecionadas serão aplicados em todo o painel administrativo e persistirão entre sessões. Todas as personalizações ficam salvas localmente no seu navegador.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Informações de Contato
                </CardTitle>
                <CardDescription>
                  Email e telefone para contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings
                  .filter((s) =>
                    ["site_email", "site_phone"].includes(s.setting_key)
                  )
                  .map((setting) => (
                    <div key={setting.id} className="space-y-3">
                      <Label htmlFor={setting.setting_key} className="text-base font-medium">
                        {getSettingLabel(setting.setting_key)}
                      </Label>
                      {renderInput(setting)}
                      {setting.description && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="text-primary">•</span>
                          {setting.description}
                        </p>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  WhatsApp
                </CardTitle>
                <CardDescription>
                  Configure o botão flutuante de WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings
                  .filter((s) =>
                    ["whatsapp_number", "whatsapp_message"].includes(s.setting_key)
                  )
                  .map((setting) => (
                    <div key={setting.id} className="space-y-3">
                      <Label htmlFor={setting.setting_key} className="text-base font-medium">
                        {getSettingLabel(setting.setting_key)}
                      </Label>
                      {renderInput(setting)}
                      {setting.description && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="text-primary">•</span>
                          {setting.description}
                        </p>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    Redes Sociais
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Links para suas redes sociais e portfólios
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Globe className="h-3 w-3" />
                  Públicas
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings
                .filter((s) =>
                  ["instagram_url", "linkedin_url", "behance_url"].includes(
                    s.setting_key
                  )
                )
                .map((setting) => (
                  <div key={setting.id} className="space-y-3">
                    <Label htmlFor={setting.setting_key} className="text-base font-medium">
                      {getSettingLabel(setting.setting_key)}
                    </Label>
                    <div className="relative">
                      {renderInput(setting)}
                      {setting.setting_value && (
                        <a
                          href={setting.setting_value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 text-sm"
                        >
                          Testar →
                        </a>
                      )}
                    </div>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-primary">•</span>
                        {setting.description}
                      </p>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <SEOSettings 
            siteTitle={settings.find(s => s.setting_key === 'site_title')?.setting_value || 'Meu Portfólio'}
            siteDescription={settings.find(s => s.setting_key === 'site_description')?.setting_value || 'Portfólio de projetos e serviços'}
          />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <UsersSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsSection;