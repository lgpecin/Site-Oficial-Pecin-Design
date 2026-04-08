import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Trash2, Plus, GripVertical, Loader2, Image, Upload } from "lucide-react";

interface CarouselImage {
  id: string;
  image_url: string;
  display_order: number;
}

const CarouselManager = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [speed, setSpeed] = useState(30);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchImages = useCallback(async () => {
    const { data, error } = await supabase
      .from("carousel_images")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar imagens do carrossel");
      return;
    }
    setImages(data || []);
    setLoading(false);
  }, []);

  const fetchSpeed = useCallback(async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "carousel_speed")
      .maybeSingle();

    if (data?.setting_value) {
      setSpeed(Number(data.setting_value));
    }
  }, []);

  useEffect(() => {
    fetchImages();
    fetchSpeed();
  }, [fetchImages, fetchSpeed]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `carousel/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase
          .from("carousel_images")
          .insert({
            image_url: urlData.publicUrl,
            display_order: images.length + 1,
          });

        if (insertError) throw insertError;
      }

      toast.success("Imagens adicionadas com sucesso!");
      fetchImages();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao fazer upload das imagens");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("carousel_images")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao remover imagem");
      return;
    }

    toast.success("Imagem removida!");
    fetchImages();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const [dragged] = newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, dragged);
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    // Save new order
    for (let i = 0; i < images.length; i++) {
      await supabase
        .from("carousel_images")
        .update({ display_order: i })
        .eq("id", images[i].id);
    }
    toast.success("Ordem atualizada!");
  };

  const handleSpeedChange = async (value: number[]) => {
    const newSpeed = value[0];
    setSpeed(newSpeed);

    // Upsert the speed setting
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("setting_key", "carousel_speed")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("site_settings")
        .update({ setting_value: String(newSpeed) })
        .eq("setting_key", "carousel_speed");
    } else {
      await supabase.from("site_settings").insert({
        setting_key: "carousel_speed",
        setting_value: String(newSpeed),
        setting_type: "number",
        description: "Velocidade do carrossel (segundos por imagem)",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Carrossel de Imagens
        </CardTitle>
        <CardDescription>
          Gerencie as imagens do carrossel infinito na seção "E quem sou eu?"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Speed control */}
        <div className="space-y-3">
          <Label>Velocidade (segundos por imagem): {speed}s</Label>
          <Slider
            value={[speed]}
            onValueChange={handleSpeedChange}
            min={5}
            max={60}
            step={1}
            className="w-full max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            Menor = mais rápido. Maior = mais lento.
          </p>
        </div>

        {/* Upload button */}
        <div>
          <Label
            htmlFor="carousel-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Enviando..." : "Adicionar Imagens"}
          </Label>
          <Input
            id="carousel-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* Image list */}
        <div className="space-y-2">
          {images.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Nenhuma imagem no carrossel. Adicione imagens acima.
            </p>
          ) : (
            images.map((img, index) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-2 rounded-lg border bg-background hover:bg-accent/50 transition-colors ${
                  draggedIndex === index ? "opacity-50" : ""
                }`}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab flex-shrink-0" />
                <img
                  src={img.image_url}
                  alt={`Carousel ${index + 1}`}
                  className="h-16 w-auto rounded object-contain"
                />
                <span className="text-sm text-muted-foreground flex-1">
                  #{index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(img.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CarouselManager;
