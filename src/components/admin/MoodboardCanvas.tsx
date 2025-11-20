import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Textbox, FabricImage, Line, Group, FabricText, Path, Point, PencilBrush } from 'fabric';
import { Button } from '@/components/ui/button';
import { Square, Circle as CircleIcon, Type, Image as ImageIcon, Pencil, Trash2, Save, ZoomIn, ZoomOut, Minus, LayoutGrid } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MoodboardCanvasProps {
  pageId: string;
}

const MoodboardCanvas = ({ pageId }: MoodboardCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'rectangle' | 'circle' | 'text' | 'image' | 'line' | 'kanban'>('select');
  const [zoom, setZoom] = useState(1);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const lineStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth || window.innerWidth - 400;
    const canvas = new FabricCanvas(canvasRef.current, {
      width: Math.max(containerWidth - 40, 800),
      height: 800,
      backgroundColor: '#ffffff',
    });

    // Initialize the freehand drawing brush
    const brush = new PencilBrush(canvas);
    brush.color = '#000000';
    brush.width = 2;
    canvas.freeDrawingBrush = brush;
    
    // Force initial render
    canvas.renderAll();

    // Zoom with mouse wheel
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom();
      newZoom *= 0.999 ** delta;
      if (newZoom > 5) newZoom = 5;
      if (newZoom < 0.1) newZoom = 0.1;
      
      const point = new Point(opt.e.offsetX, opt.e.offsetY);
      canvas.zoomToPoint(point, newZoom);
      setZoom(newZoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Pan with space + drag
    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    canvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      if (evt.shiftKey === true) {
        isDragging = true;
        canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isDragging) {
        const evt = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += evt.clientX - lastPosX;
          vpt[5] += evt.clientY - lastPosY;
          canvas.requestRenderAll();
          lastPosX = evt.clientX;
          lastPosY = evt.clientY;
        }
      }
    });

    canvas.on('mouse:up', () => {
      canvas.setViewportTransform(canvas.viewportTransform);
      isDragging = false;
      canvas.selection = true;
    });

    setFabricCanvas(canvas);
    loadCanvasData(canvas);
    
    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = Math.max(containerRef.current.offsetWidth - 40, 800);
        canvas.setWidth(newWidth);
        canvas.renderAll();
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [pageId]);

  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    // Reset line drawing when tool changes
    if (activeTool !== 'line') {
      setIsDrawingLine(false);
      lineStartRef.current = null;
    }
  }, [activeTool, fabricCanvas]);

  const loadCanvasData = async (canvas: FabricCanvas) => {
    try {
      const { data, error } = await supabase
        .from('moodboard_elements')
        .select('*')
        .eq('page_id', pageId);

      if (error) throw error;

      if (data && data.length > 0) {
        for (const element of data) {
          const objData = element.element_data as any;
          
          // Handle different object types
          if (objData.type === 'group' && objData.objects) {
            // It's a kanban card - reconstruct it
            const objects = await Promise.all(
              objData.objects.map(async (obj: any) => {
                if (obj.type === 'rect') {
                  return new Rect(obj);
                } else if (obj.type === 'text' || obj.type === 'textbox') {
                  return new FabricText(obj.text, obj);
                }
                return null;
              })
            );
            
            const group = new Group(objects.filter(Boolean), {
              left: objData.left,
              top: objData.top,
              selectable: true,
            });
            canvas.add(group);
          } else {
            // Regular object
            let obj;
            switch (objData.type) {
              case 'rect':
                obj = new Rect(objData);
                break;
              case 'circle':
                obj = new Circle(objData);
                break;
              case 'line':
                obj = new Line([objData.x1, objData.y1, objData.x2, objData.y2], objData);
                break;
              case 'textbox':
                obj = new Textbox(objData.text, objData);
                break;
              case 'path':
                obj = new Path(objData.path, objData);
                break;
              default:
                continue;
            }
            if (obj) canvas.add(obj);
          }
        }
        canvas.renderAll();
      }
    } catch (error) {
      console.error('Error loading canvas:', error);
    }
  };

  const saveCanvas = async () => {
    if (!fabricCanvas) return;

    try {
      await supabase
        .from('moodboard_elements')
        .delete()
        .eq('page_id', pageId);

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

  const createKanbanCard = () => {
    if (!fabricCanvas) return;

    const cardWidth = 200;
    const cardHeight = 120;

    const rect = new Rect({
      width: cardWidth,
      height: cardHeight,
      fill: '#ffffff',
      stroke: '#e5e7eb',
      strokeWidth: 2,
      rx: 8,
      ry: 8,
    });

    const title = new FabricText('Card Kanban', {
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#1f2937',
      top: 15,
      left: 15,
    });

    const description = new FabricText('Descrição do card', {
      fontSize: 12,
      fill: '#6b7280',
      top: 45,
      left: 15,
    });

    const tag = new Rect({
      width: 60,
      height: 20,
      fill: '#6366f1',
      rx: 4,
      ry: 4,
      top: 85,
      left: 15,
    });

    const tagText = new FabricText('Tag', {
      fontSize: 10,
      fill: '#ffffff',
      top: 90,
      left: 30,
    });

    const group = new Group([rect, title, description, tag, tagText], {
      left: 100,
      top: 100,
      selectable: true,
    });

    fabricCanvas.add(group);
    fabricCanvas.setActiveObject(group);
    fabricCanvas.renderAll();
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
    } else if (tool === 'kanban') {
      createKanbanCard();
    } else if (tool === 'line') {
      // Line tool will be handled by mouse events
      setIsDrawingLine(true);
    }
  };

  useEffect(() => {
    if (!fabricCanvas || activeTool !== 'line') return;

    const handleMouseDown = (opt: any) => {
      const pointer = fabricCanvas.getPointer(opt.e);
      lineStartRef.current = { x: pointer.x, y: pointer.y };
    };

    const handleMouseUp = (opt: any) => {
      if (!lineStartRef.current) return;
      
      const pointer = fabricCanvas.getPointer(opt.e);
      const line = new Line(
        [lineStartRef.current.x, lineStartRef.current.y, pointer.x, pointer.y],
        {
          stroke: '#000000',
          strokeWidth: 2,
        }
      );
      
      fabricCanvas.add(line);
      lineStartRef.current = null;
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:up', handleMouseUp);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:up', handleMouseUp);
    };
  }, [fabricCanvas, activeTool]);

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

  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    let newZoom = fabricCanvas.getZoom() * 1.1;
    if (newZoom > 5) newZoom = 5;
    fabricCanvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    let newZoom = fabricCanvas.getZoom() / 1.1;
    if (newZoom < 0.1) newZoom = 0.1;
    fabricCanvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const handleResetZoom = () => {
    if (!fabricCanvas) return;
    fabricCanvas.setZoom(1);
    fabricCanvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    fabricCanvas.renderAll();
    setZoom(1);
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
    <div className="space-y-4" ref={containerRef}>
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
          variant={activeTool === 'line' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolClick('line')}
        >
          <Minus className="h-4 w-4 mr-2" />
          Linha
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
        <Button
          variant={activeTool === 'kanban' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolClick('kanban')}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Card Kanban
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
        
        <div className="h-6 w-px bg-border mx-2" />
        
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4 mr-2" />
          Zoom +
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4 mr-2" />
          Zoom -
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetZoom}>
          {Math.round(zoom * 100)}%
        </Button>
        
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

      <div className="border rounded-lg overflow-hidden shadow-lg bg-muted/20">
        <div className="text-xs text-muted-foreground p-2 bg-card border-b">
          Dica: Use Shift + Arrastar para mover o canvas | Scroll para zoom
        </div>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default MoodboardCanvas;