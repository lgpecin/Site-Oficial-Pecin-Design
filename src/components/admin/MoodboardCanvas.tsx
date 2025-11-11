import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Textbox, FabricImage, Path } from 'fabric';
import { Button } from '@/components/ui/button';
import { Square, Circle as CircleIcon, Type, Image as ImageIcon, Pencil, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MoodboardCanvasProps {
  pageId: string;
}

const MoodboardCanvas = ({ pageId }: MoodboardCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'rectangle' | 'circle' | 'text' | 'image'>('select');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth - 400,
      height: 600,
      backgroundColor: '#ffffff',
    });

    canvas.freeDrawingBrush.color = '#000000';
    canvas.freeDrawingBrush.width = 2;

    setFabricCanvas(canvas);
    loadCanvasData(canvas);

    return () => {
      canvas.dispose();
    };
  }, [pageId]);

  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.isDrawingMode = activeTool === 'draw';
  }, [activeTool, fabricCanvas]);

  const loadCanvasData = async (canvas: FabricCanvas) => {
    try {
      const { data, error } = await supabase
        .from('moodboard_elements')
        .select('*')
        .eq('page_id', pageId);

      if (error) throw error;

      data?.forEach((element) => {
        const objData = element.element_data as any;
        canvas.add(objData);
      });
      canvas.renderAll();
    } catch (error) {
      console.error('Error loading canvas:', error);
    }
  };

  const saveCanvas = async () => {
    if (!fabricCanvas) return;

    try {
      // Delete existing elements
      await supabase
        .from('moodboard_elements')
        .delete()
        .eq('page_id', pageId);

      // Save new elements
      const objects = fabricCanvas.getObjects();
      const elements = objects.map((obj) => ({
        page_id: pageId,
        element_type: obj.type || 'unknown',
        element_data: obj.toJSON(),
      }));

      if (elements.length > 0) {
        const { error } = await supabase
          .from('moodboard_elements')
          .insert(elements);

        if (error) throw error;
      }

      toast.success('Canvas salvo!');
    } catch (error) {
      console.error('Error saving canvas:', error);
      toast.error('Erro ao salvar canvas');
    }
  };

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: '#6366f1',
        width: 100,
        height: 100,
      });
      fabricCanvas.add(rect);
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: '#6366f1',
        radius: 50,
      });
      fabricCanvas.add(circle);
    } else if (tool === 'text') {
      const text = new Textbox('Digite aqui', {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: '#000000',
      });
      fabricCanvas.add(text);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      FabricImage.fromURL(imgUrl).then((img) => {
        img.scaleToWidth(300);
        fabricCanvas.add(img);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
  };

  const handleDelete = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    activeObjects.forEach((obj) => fabricCanvas.remove(obj));
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-4 bg-card border rounded-lg flex-wrap">
        <Button
          variant={activeTool === 'select' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTool('select')}
        >
          Selecionar
        </Button>
        <Button
          variant={activeTool === 'draw' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTool('draw')}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Desenhar
        </Button>
        <Button
          variant={activeTool === 'rectangle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolClick('rectangle')}
        >
          <Square className="h-4 w-4 mr-2" />
          Retângulo
        </Button>
        <Button
          variant={activeTool === 'circle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolClick('circle')}
        >
          <CircleIcon className="h-4 w-4 mr-2" />
          Círculo
        </Button>
        <Button
          variant={activeTool === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolClick('text')}
        >
          <Type className="h-4 w-4 mr-2" />
          Texto
        </Button>
        <label>
          <Button variant="outline" size="sm" asChild>
            <span>
              <ImageIcon className="h-4 w-4 mr-2" />
              Imagem
            </span>
          </Button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
        <div className="flex-1" />
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
        <Button variant="outline" size="sm" onClick={handleClear}>
          Limpar
        </Button>
        <Button size="sm" onClick={saveCanvas}>
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-lg">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default MoodboardCanvas;