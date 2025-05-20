
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Circle, Check, Pencil, Plus, Undo2, Trash2, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AnnotationType {
  id: string;
  type: 'green-circle' | 'red-circle' | 'blue-circle' | 'yellow-line' | 'pink-line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  note?: string;
}

interface Photo {
  id: string;
  src: string;
  alt: string;
  annotations: AnnotationType[];
}

// Enhanced demo photos with real property images
const demoPhotos: Photo[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1472396961693-142e6e269027',
    alt: 'Property with trees',
    annotations: [
      {
        id: 'a1',
        type: 'green-circle',
        x: 150,
        y: 120,
        width: 40,
        height: 40,
        note: 'Tree to cut'
      },
      {
        id: 'a2',
        type: 'red-circle',
        x: 250,
        y: 180,
        width: 40,
        height: 40,
        note: 'Preserve this tree'
      }
    ]
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d',
    alt: 'Lawn with trees',
    annotations: [
      {
        id: 'a3',
        type: 'yellow-line',
        x: 0,
        y: 0,
        points: [{ x: 120, y: 150 }, { x: 300, y: 250 }],
        note: 'Primary path'
      }
    ]
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
    alt: 'House with large trees',
    annotations: []
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    alt: 'Aerial view of property',
    annotations: []
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b',
    alt: 'Aerial boundary view',
    annotations: []
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3',
    alt: 'Property boundary wall',
    annotations: []
  }
];

const AnnotatedPhotoUpload = () => {
  const [photos, setPhotos] = useState<Photo[]>(demoPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationType, setAnnotationType] = useState<AnnotationType['type']>('green-circle');
  const [currentAnnotation, setCurrentAnnotation] = useState<AnnotationType | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotationPosition, setAnnotationPosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  // Effect to render annotations whenever the selectedPhoto changes or annotations are added/removed
  useEffect(() => {
    if (selectedPhoto && isAnnotating) {
      renderAnnotations();
    }
  }, [selectedPhoto, isAnnotating, hoveredAnnotation]);
  
  const openAnnotationMode = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsAnnotating(true);
    setCurrentAnnotation(null);
  };

  const closeAnnotationMode = () => {
    setSelectedPhoto(null);
    setIsAnnotating(false);
    setCurrentAnnotation(null);
    setShowNoteDialog(false);
    setNoteText("");
  };
  
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedPhoto) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    
    // Create a new annotation based on the selected type
    const newAnnotation: AnnotationType = {
      id: `a${Date.now()}`,
      type: annotationType,
      x,
      y,
      width: annotationType.includes('circle') ? 40 : 0,
      height: annotationType.includes('circle') ? 40 : 0,
      points: annotationType.includes('line') ? [{ x, y }] : undefined,
    };
    
    setCurrentAnnotation(newAnnotation);
    
    if (annotationType.includes('circle')) {
      // For circles, we set position for the note dialog
      setAnnotationPosition({ x, y });
      // Immediate show dialog for circles
      setShowNoteDialog(true);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentAnnotation || !isDrawing || !annotationType.includes('line')) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update line points for rendering
    if (currentAnnotation.points) {
      const updatedPoints = [currentAnnotation.points[0], { x, y }];
      setCurrentAnnotation({
        ...currentAnnotation,
        points: updatedPoints
      });
    }
    
    renderAnnotations();
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation || !annotationType.includes('line')) return;
    
    setIsDrawing(false);
    
    if (currentAnnotation && annotationType.includes('line') && currentAnnotation.points && currentAnnotation.points.length > 1) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate midpoint of the line for note placement
      const x1 = currentAnnotation.points[0].x;
      const y1 = currentAnnotation.points[0].y;
      const x2 = x;
      const y2 = y;
      
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      setAnnotationPosition({ x: midX, y: midY });
      setShowNoteDialog(true);
    }
  };

  const saveAnnotation = () => {
    if (!selectedPhoto || !currentAnnotation) return;
    
    // Add note to the annotation
    const annotationWithNote = { 
      ...currentAnnotation, 
      note: noteText.trim() || undefined 
    };
    
    // Save annotation to the photo
    const updatedPhotos = photos.map(photo => {
      if (photo.id === selectedPhoto.id) {
        return {
          ...photo,
          annotations: [...photo.annotations, annotationWithNote]
        };
      }
      return photo;
    });
    
    setPhotos(updatedPhotos);
    setCurrentAnnotation(null);
    setShowNoteDialog(false);
    setNoteText("");
    
    // Update the selectedPhoto reference
    const updatedSelectedPhoto = updatedPhotos.find(p => p.id === selectedPhoto.id);
    if (updatedSelectedPhoto) {
      setSelectedPhoto(updatedSelectedPhoto);
    }
  };

  const cancelAnnotation = () => {
    setCurrentAnnotation(null);
    setShowNoteDialog(false);
    setNoteText("");
    renderAnnotations();
  };

  const deleteAnnotation = (annotationId: string) => {
    if (!selectedPhoto) return;
    
    const updatedPhotos = photos.map(photo => {
      if (photo.id === selectedPhoto.id) {
        return {
          ...photo,
          annotations: photo.annotations.filter(a => a.id !== annotationId)
        };
      }
      return photo;
    });
    
    setPhotos(updatedPhotos);
    
    // Update the selectedPhoto reference
    const updatedSelectedPhoto = updatedPhotos.find(p => p.id === selectedPhoto.id);
    if (updatedSelectedPhoto) {
      setSelectedPhoto(updatedSelectedPhoto);
    }
  };

  const handleAnnotationHover = (annotationId: string | null) => {
    setHoveredAnnotation(annotationId);
    renderAnnotations();
  };

  const undoLastAnnotation = () => {
    if (!selectedPhoto || selectedPhoto.annotations.length === 0) return;
    
    const updatedPhotos = photos.map(photo => {
      if (photo.id === selectedPhoto.id) {
        const newAnnotations = [...photo.annotations];
        newAnnotations.pop(); // Remove the last annotation
        return {
          ...photo,
          annotations: newAnnotations
        };
      }
      return photo;
    });
    
    setPhotos(updatedPhotos);
    
    // Update the selectedPhoto reference
    const updatedSelectedPhoto = updatedPhotos.find(p => p.id === selectedPhoto.id);
    if (updatedSelectedPhoto) {
      setSelectedPhoto(updatedSelectedPhoto);
    }
  };

  // New function to save all annotations
  const saveAllAnnotations = () => {
    // In a real app, this would persist to a database
    // For now we'll just show a toast confirmation
    toast({
      title: "Success",
      description: "Annotations saved successfully.",
      duration: 3000,
    });
  };

  const renderAnnotations = () => {
    if (!canvasRef.current || !selectedPhoto || !imageRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas and draw image
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Ensure canvas size matches the image
    if (imageRef.current.complete && imageRef.current.naturalWidth) {
      canvasRef.current.width = imageRef.current.clientWidth;
      canvasRef.current.height = imageRef.current.clientHeight;
      ctx.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    // Draw all saved annotations
    selectedPhoto.annotations.forEach(ann => {
      const isHovered = hoveredAnnotation === ann.id;
      drawAnnotation(ctx, ann, isHovered);
      
      // Always show notes directly on the image
      if (ann.note) {
        drawAnnotationNote(ctx, ann);
      }
    });
    
    // Draw current annotation if exists
    if (currentAnnotation) {
      drawAnnotation(ctx, currentAnnotation);
    }
  };
  
  const drawAnnotation = (ctx: CanvasRenderingContext2D, ann: AnnotationType, isHovered: boolean = false) => {
    ctx.beginPath();
    
    // Set line width based on hover state
    ctx.lineWidth = isHovered ? 4 : 3;
    
    if (ann.type.includes('circle')) {
      const radius = (ann.width || 40) / 2;
      
      // Set color based on annotation type
      if (ann.type === 'green-circle') ctx.strokeStyle = '#22c55e'; // green-500
      else if (ann.type === 'red-circle') ctx.strokeStyle = '#ef4444'; // red-500
      else if (ann.type === 'blue-circle') ctx.strokeStyle = '#3b82f6'; // blue-500
      
      ctx.arc(ann.x, ann.y, radius, 0, 2 * Math.PI);
    } else if (ann.type.includes('line') && ann.points && ann.points.length > 1) {
      // Set color based on annotation type
      if (ann.type === 'yellow-line') ctx.strokeStyle = '#eab308'; // yellow-500
      else if (ann.type === 'pink-line') ctx.strokeStyle = '#ec4899'; // pink-500
      
      ctx.moveTo(ann.points[0].x, ann.points[0].y);
      ctx.lineTo(ann.points[1].x, ann.points[1].y);
    }
    
    ctx.stroke();
  };

  // Updated function to show notes directly on canvas
  const drawAnnotationNote = (ctx: CanvasRenderingContext2D, ann: AnnotationType) => {
    if (!ann.note) return;
    
    // Calculate note position
    let x, y;
    if (ann.type.includes('circle')) {
      x = ann.x + 20;
      y = ann.y - 20;
    } else if (ann.points && ann.points.length > 1) {
      // For lines, put note at midpoint
      x = (ann.points[0].x + ann.points[1].x) / 2 + 10;
      y = (ann.points[0].y + ann.points[1].y) / 2 - 10;
    } else {
      return;
    }
    
    // Determine background color based on annotation type
    let bgColor;
    if (ann.type === 'green-circle') bgColor = 'rgba(34, 197, 94, 0.9)';
    else if (ann.type === 'red-circle') bgColor = 'rgba(239, 68, 68, 0.9)';
    else if (ann.type === 'blue-circle') bgColor = 'rgba(59, 130, 246, 0.9)';
    else if (ann.type === 'yellow-line') bgColor = 'rgba(234, 179, 8, 0.9)';
    else if (ann.type === 'pink-line') bgColor = 'rgba(236, 72, 153, 0.9)';
    
    // Determine the text color (white for most colors, black for yellow)
    const textColor = ann.type === 'yellow-line' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    
    // Draw note tag
    ctx.fillStyle = bgColor;
    
    const noteText = ann.note || "";
    const noteWidth = Math.min(ctx.measureText(noteText).width + 10, 150);
    const noteHeight = 20;
    
    // Draw rounded rectangle
    ctx.beginPath();
    ctx.roundRect(x, y, noteWidth, noteHeight, 4);
    ctx.fill();
    
    // Draw note text
    ctx.fillStyle = textColor;
    ctx.font = '11px sans-serif';
    ctx.fillText(noteText.length > 20 ? noteText.substring(0, 20) + '...' : noteText, x + 4, y + 14);
    
    // If hovered and text is longer than what's shown
    if (hoveredAnnotation === ann.id && noteText.length > 20) {
      // Draw expanded tooltip
      const expandedHeight = 40;
      const expandedWidth = Math.min(ctx.measureText(noteText).width + 20, 200);
      
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(x, y - 20, expandedWidth, expandedHeight, 4);
      ctx.fill();
      
      // Draw wrapped text
      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      
      const words = noteText.split(' ');
      let line = '';
      let lineY = y - 5;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > expandedWidth - 20 && i > 0) {
          ctx.fillText(line, x + 4, lineY);
          line = words[i] + ' ';
          lineY += 15;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x + 4, lineY);
    }
  };

  const drawAnnotationTooltip = (ctx: CanvasRenderingContext2D, ann: AnnotationType) => {
    if (!ann.note) return;
    
    // Calculate tooltip position
    let x, y;
    if (ann.type.includes('circle')) {
      x = ann.x + 20;
      y = ann.y - 20;
    } else if (ann.points && ann.points.length > 1) {
      // For lines, put tooltip at midpoint
      x = (ann.points[0].x + ann.points[1].x) / 2 + 10;
      y = (ann.points[0].y + ann.points[1].y) / 2 - 10;
    } else {
      return;
    }
    
    // Draw tooltip background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    
    const textMetrics = ctx.measureText(ann.note);
    const textWidth = textMetrics.width + 10;
    const textHeight = 25;
    
    ctx.beginPath();
    ctx.roundRect(x, y - textHeight, textWidth, textHeight, 4);
    ctx.fill();
    ctx.stroke();
    
    // Draw tooltip text
    ctx.fillStyle = 'black';
    ctx.font = '12px sans-serif';
    ctx.fillText(ann.note, x + 5, y - 8);
  };

  const loadImage = (src: string) => {
    if (imageRef.current) {
      imageRef.current.src = src;
      imageRef.current.onload = () => renderAnnotations();
    }
  };

  // Effect for initial image loading when entering annotation mode
  useEffect(() => {
    if (selectedPhoto && isAnnotating) {
      loadImage(selectedPhoto.src);
    }
  }, [selectedPhoto, isAnnotating]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Upload Photos</h2>
      
      {!isAnnotating ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photos.map(photo => (
            <div 
              key={photo.id} 
              className={cn(
                "border rounded-lg p-2 hover:shadow-md transition-all cursor-pointer",
                "transform hover:scale-[1.02] duration-200"
              )}
              onClick={() => openAnnotationMode(photo)}
            >
              <img 
                src={photo.src}
                alt={photo.alt}
                className="w-full h-48 object-cover rounded-md mb-2"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{photo.alt}</span>
                <div className="flex items-center">
                  {photo.annotations.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">
                      {photo.annotations.length} annotations
                    </span>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAnnotationMode(photo);
                    }}
                  >
                    <Pencil className="h-3 w-3 mr-1" /> Annotate
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="border rounded-lg p-2 flex flex-col items-center justify-center bg-gray-50 h-64">
            <Button variant="ghost" className="flex-col h-full w-full">
              <Plus className="h-8 w-8 mb-2" />
              <span>Add New Photo</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Annotate Photo</h3>
            <div className="flex gap-2">
              {selectedPhoto && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={saveAllAnnotations}
                  className="flex items-center bg-primary text-white"
                >
                  <Save className="h-4 w-4 mr-1" /> Save Annotations
                </Button>
              )}
              {selectedPhoto && selectedPhoto.annotations.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={undoLastAnnotation}
                  className="flex items-center"
                >
                  <Undo2 className="h-4 w-4 mr-1" /> Undo
                </Button>
              )}
              <Button variant="outline" onClick={closeAnnotationMode}>Close</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-1">
              <div className="space-y-4 sticky top-4">
                <div>
                  <h4 className="font-medium mb-2">Annotation Types</h4>
                  <RadioGroup 
                    value={annotationType} 
                    onValueChange={(value) => setAnnotationType(value as AnnotationType['type'])}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="green-circle" id="green-circle" />
                      <Label htmlFor="green-circle" className="flex items-center">
                        <Circle className="h-4 w-4 text-green-500 mr-1" /> 
                        <span className="text-sm">Green Circle - Trees to cut</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="red-circle" id="red-circle" />
                      <Label htmlFor="red-circle" className="flex items-center">
                        <Circle className="h-4 w-4 text-red-500 mr-1" /> 
                        <span className="text-sm">Red Circle - Trees not to cut</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blue-circle" id="blue-circle" />
                      <Label htmlFor="blue-circle" className="flex items-center">
                        <Circle className="h-4 w-4 text-blue-500 mr-1" /> 
                        <span className="text-sm">Blue Circle - Machine placement</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yellow-line" id="yellow-line" />
                      <Label htmlFor="yellow-line" className="flex items-center">
                        <span className="h-[2px] w-4 bg-yellow-500 mr-1"></span>
                        <span className="text-sm">Yellow Line - Path to house</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pink-line" id="pink-line" />
                      <Label htmlFor="pink-line" className="flex items-center">
                        <span className="h-[2px] w-4 bg-pink-500 mr-1"></span>
                        <span className="text-sm">Pink Line - Alternate path</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {selectedPhoto?.annotations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Annotations Summary</h4>
                    <div className="space-y-2 text-sm max-h-[300px] overflow-y-auto pr-1">
                      {selectedPhoto.annotations.map((ann, i) => (
                        <div 
                          key={ann.id} 
                          className={cn(
                            "p-2 border rounded-md group flex justify-between transition-all",
                            hoveredAnnotation === ann.id ? "bg-gray-50 shadow-sm" : "",
                          )}
                          onMouseEnter={() => handleAnnotationHover(ann.id)}
                          onMouseLeave={() => handleAnnotationHover(null)}
                        >
                          <div>
                            <div className="font-medium flex items-center">
                              {ann.type.includes('circle') ? (
                                <Circle 
                                  className={cn(
                                    "h-3 w-3 mr-1",
                                    ann.type === 'green-circle' ? "text-green-500" : 
                                    ann.type === 'red-circle' ? "text-red-500" : 
                                    "text-blue-500"
                                  )} 
                                />
                              ) : (
                                <div className={cn(
                                  "h-[2px] w-3 mr-1",
                                  ann.type === 'yellow-line' ? "bg-yellow-500" : "bg-pink-500"
                                )} />
                              )}
                              {ann.type.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </div>
                            {ann.note && (
                              <div className="text-xs text-gray-600 mt-1 ml-4">
                                {ann.note}
                              </div>
                            )}
                          </div>
                          <button 
                            className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteAnnotation(ann.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Instructions */}
                <div className="bg-blue-50 p-3 rounded-md mt-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Instructions:</h4>
                  <ul className="list-disc list-inside text-xs text-blue-800">
                    <li>Select an annotation type</li>
                    <li>Click on the image to place a circle</li>
                    <li>Click and drag to draw a line</li>
                    <li>Add an optional note to explain the annotation</li>
                    <li>Hover over annotations to see details</li>
                    <li>Click Save when finished</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="col-span-4 relative" ref={containerRef}>
              {selectedPhoto && (
                <>
                  <div className="border rounded-lg overflow-hidden shadow-lg bg-white transition-all">
                    <img
                      ref={imageRef}
                      src={selectedPhoto.src}
                      alt={selectedPhoto.alt}
                      className="w-full h-auto"
                      onLoad={() => renderAnnotations()}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                    />
                  </div>
                  
                  {showNoteDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                      <div className="bg-white p-4 rounded-lg w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-medium mb-3">Add Note</h3>
                        <Textarea
                          placeholder="E.g., This tree is leaning toward the roof"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="min-h-[100px] mb-4"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={cancelAnnotation}>Cancel</Button>
                          <Button onClick={saveAnnotation} className="bg-primary text-white">
                            <Check className="h-4 w-4 mr-1" /> Save Annotation
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotatedPhotoUpload;
