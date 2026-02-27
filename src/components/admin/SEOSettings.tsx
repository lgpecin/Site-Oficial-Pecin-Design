import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Loader2, 
  Save, 
  Upload,
  Image as ImageIcon,
  Globe,
  FileText,
  Tag
} from "lucide-react";

interface SEOData {
  seo_meta_title: string;
  seo_meta_description: string;
  seo_meta_keywords: string;
  seo_meta_author: string;
  seo_og_title: string;
  seo_og_description: string;
  seo_og_image: string;
  seo_favicon_url: string;
}

interface SEOSettingsProps {
  siteTitle: string;
  siteDescription: string;
}

const SEOSettings = ({ siteTitle, siteDescription }: SEOSettingsProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  
  const [seoData, setSeoData] = useState<SEOData>({
    seo_meta_title: "",
    seo_meta_description: "",
    seo_meta_keywords: "",
    seo_meta_author: "",
    seo_og_title: "",
    seo_og_description: "",
    seo_og_image: "",
    seo_favicon_url: "",
  });

  useEffect(() => {
    fetchSEOData();
  }, []);

  const fetchSEOData = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", [
          "seo_meta_title",
          "seo_meta_description",
          "seo_meta_keywords",
          "seo_meta_author",
          "seo_og_title",
          "seo_og_description",
          "seo_og_image",
          "seo_favicon_url",
        ]);

      if (error) throw error;

      const seoSettings: any = {};
      data?.forEach((setting) => {
        seoSettings[setting.setting_key] = setting.setting_value || "";
      });

      setSeoData({
        seo_meta_title: seoSettings.seo_meta_title || siteTitle,
        seo_meta_description: seoSettings.seo_meta_description || siteDescription,
        seo_meta_keywords: seoSettings.seo_meta_keywords || "",
        seo_meta_author: seoSettings.seo_meta_author || "",
        seo_og_title: seoSettings.seo_og_title || siteTitle,
        seo_og_description: seoSettings.seo_og_description || siteDescription,
        seo_og_image: seoSettings.seo_og_image || "",
        seo_favicon_url: seoSettings.seo_favicon_url || "",
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error fetching SEO data:", error);
      toast.error("Erro ao carregar dados de SEO");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(seoData)) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({
            setting_key: key,
            setting_value: value,
            setting_type: "text",
          }, {
            onConflict: "setting_key"
          });

        if (error) throw error;
      }

      // Update meta tags dynamically
      updateMetaTags();
      
      toast.success("Configurações de SEO salvas com sucesso!");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error saving SEO data:", error);
      toast.error("Erro ao salvar configurações de SEO");
    } finally {
      setSaving(false);
    }
  };

  const updateMetaTags = () => {
    // Update title
    document.title = seoData.seo_meta_title || siteTitle;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", seoData.seo_meta_description || siteDescription);
    }
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", seoData.seo_meta_keywords);
    }
    
    // Update meta author
    let metaAuthor = document.querySelector('meta[name="author"]');
    if (metaAuthor) {
      metaAuthor.setAttribute("content", seoData.seo_meta_author);
    }
    
    // Update OG tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", seoData.seo_og_title || siteTitle);
    }
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", seoData.seo_og_description || siteDescription);
    }
    
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && seoData.seo_og_image) {
      ogImage.setAttribute("content", seoData.seo_og_image);
    }
  };

  const handleFileUpload = async (file: File, type: 'favicon' | 'ogimage') => {
    const setter = type === 'favicon' ? setUploadingFavicon : setUploadingOgImage;
    setter(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `seo/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      if (type === 'favicon') {
        setSeoData(prev => ({ ...prev, seo_favicon_url: publicUrl }));
        // Update favicon dynamically
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = publicUrl;
      } else {
        setSeoData(prev => ({ ...prev, seo_og_image: publicUrl }));
      }

      toast.success(`${type === 'favicon' ? 'Favicon' : 'Imagem OG'} carregada com sucesso!`);
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Error uploading ${type}:`, error);
      toast.error(`Erro ao fazer upload de ${type === 'favicon' ? 'favicon' : 'imagem'}`);
    } finally {
      setter(false);
    }
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
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar SEO
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 rounded-md">
            <Globe className="h-4 w-4 text-blue-500" />
          </div>
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Conexão com Aba "Geral"
            </p>
            <p className="text-sm text-muted-foreground">
              Os campos abaixo usam o <strong>Título</strong> e <strong>Descrição</strong> da aba "Geral" como valores padrão. 
              Você pode personalizar aqui especificamente para SEO sem alterar os valores gerais do site.
            </p>
          </div>
        </div>
      </div>

      {/* Meta Tags */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Meta Tags Básicas
              </CardTitle>
              <CardDescription className="mt-1">
                Informações exibidas nos resultados de busca
              </CardDescription>
            </div>
            <Badge variant="secondary">Google</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="meta-title" className="text-base font-medium">
              Título da Página (Meta Title)
            </Label>
            <Input
              id="meta-title"
              value={seoData.seo_meta_title}
              onChange={(e) => setSeoData({ ...seoData, seo_meta_title: e.target.value })}
              placeholder={`Padrão: ${siteTitle}`}
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              Máximo 60 caracteres • {seoData.seo_meta_title.length}/60
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="meta-description" className="text-base font-medium">
              Descrição (Meta Description)
            </Label>
            <Textarea
              id="meta-description"
              value={seoData.seo_meta_description}
              onChange={(e) => setSeoData({ ...seoData, seo_meta_description: e.target.value })}
              placeholder={`Padrão: ${siteDescription}`}
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              Máximo 160 caracteres • {seoData.seo_meta_description.length}/160
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="meta-keywords" className="text-base font-medium">
              Palavras-chave (Keywords)
            </Label>
            <Input
              id="meta-keywords"
              value={seoData.seo_meta_keywords}
              onChange={(e) => setSeoData({ ...seoData, seo_meta_keywords: e.target.value })}
              placeholder="design, portfolio, criativo, web design"
            />
            <p className="text-xs text-muted-foreground">
              Separe por vírgulas
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="meta-author" className="text-base font-medium">
              Autor (Author)
            </Label>
            <Input
              id="meta-author"
              value={seoData.seo_meta_author}
              onChange={(e) => setSeoData({ ...seoData, seo_meta_author: e.target.value })}
              placeholder="Seu nome ou empresa"
            />
          </div>
        </CardContent>
      </Card>

      {/* Open Graph */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Open Graph Tags
              </CardTitle>
              <CardDescription className="mt-1">
                Como seu site aparece ao ser compartilhado em redes sociais
              </CardDescription>
            </div>
            <Badge variant="outline">Redes Sociais</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="og-title" className="text-base font-medium">
              Título OG (og:title)
            </Label>
            <Input
              id="og-title"
              value={seoData.seo_og_title}
              onChange={(e) => setSeoData({ ...seoData, seo_og_title: e.target.value })}
              placeholder={`Padrão: ${siteTitle}`}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="og-description" className="text-base font-medium">
              Descrição OG (og:description)
            </Label>
            <Textarea
              id="og-description"
              value={seoData.seo_og_description}
              onChange={(e) => setSeoData({ ...seoData, seo_og_description: e.target.value })}
              placeholder={`Padrão: ${siteDescription}`}
              rows={3}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base font-medium">
              Imagem de Preview (og:image)
            </Label>
            <p className="text-sm text-muted-foreground">
              Recomendado: 1200x630px
            </p>
            
            {seoData.seo_og_image && (
              <div className="relative w-full max-w-md">
                <img 
                  src={seoData.seo_og_image} 
                  alt="OG Preview" 
                  className="w-full rounded-lg border-2"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={uploadingOgImage}
                onClick={() => document.getElementById('og-image-upload')?.click()}
              >
                {uploadingOgImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {seoData.seo_og_image ? 'Alterar Imagem' : 'Carregar Imagem'}
                  </>
                )}
              </Button>
              <input
                id="og-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'ogimage');
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favicon */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Favicon
              </CardTitle>
              <CardDescription className="mt-1">
                Ícone que aparece na aba do navegador
              </CardDescription>
            </div>
            <Badge variant="secondary">Visual</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Recomendado: 32x32px ou 64x64px (PNG ou ICO)
          </p>

          {seoData.seo_favicon_url && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
              <img 
                src={seoData.seo_favicon_url} 
                alt="Favicon" 
                className="w-8 h-8"
              />
              <span className="text-sm">Favicon atual</span>
            </div>
          )}

          <Button
            variant="outline"
            disabled={uploadingFavicon}
            onClick={() => document.getElementById('favicon-upload')?.click()}
          >
            {uploadingFavicon ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {seoData.seo_favicon_url ? 'Alterar Favicon' : 'Carregar Favicon'}
              </>
            )}
          </Button>
          <input
            id="favicon-upload"
            type="file"
            accept="image/x-icon,image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, 'favicon');
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOSettings;
