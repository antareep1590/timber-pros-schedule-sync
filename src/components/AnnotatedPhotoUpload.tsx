
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Circle, CircleDot, CircleX, Pencil, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface AnnotationType {
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
    annotations: []
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d',
    alt: 'Lawn with trees',
    annotations: []
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Effect to render annotations whenever the selectedPhoto changes or annotations are added/removed
  useEffect(() => {
    if (selectedPhoto && isAnnotating) {
      renderAnnotations();
    }
  }, [selectedPhoto, isAnnotating]);
  
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
      type: annotationType,
      x,
      y,
      width: annotationType.includes('circle') ? 40 : 0,
      height: annotationType.includes('circle') ? 40 : 0,
      points: annotationType.includes('line') ? [{ x, y }] : undefined,
    };
    
    setCurrentAnnotation(newAnnotation);
    
    if (annotationType.includes('circle')) {
      // For circles, we immediately prepare to save the annotation
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

  const handleCanvasMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (currentAnnotation && annotationType.includes('line') && currentAnnotation.points && currentAnnotation.points.length > 1) {
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

  const renderAnnotations = () => {
    if (!canvasRef.current || !selectedPhoto || !imageRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas and draw image
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Ensure canvas size matches the image
    if (imageRef.current.complete && imageRef.current.naturalWidth) {
      canvasRef.current.width = imageRef.current.naturalWidth;
      canvasRef.current.height = imageRef.current.naturalHeight;
      ctx.drawImage(imageRef.current, 0, 0);
    }
    
    // Draw all saved annotations
    selectedPhoto.annotations.forEach(ann => {
      drawAnnotation(ctx, ann);
    });
    
    // Draw current annotation if exists
    if (currentAnnotation) {
      drawAnnotation(ctx, currentAnnotation);
    }
  };
  
  const drawAnnotation = (ctx: CanvasRenderingContext2D, ann: AnnotationType) => {
    ctx.beginPath();
    
    if (ann.type.includes('circle')) {
      ctx.lineWidth = 3;
      const radius = (ann.width || 40) / 2;
      
      // Set color based on annotation type
      if (ann.type === 'green-circle') ctx.strokeStyle = 'green';
      else if (ann.type === 'red-circle') ctx.strokeStyle = 'red';
      else if (ann.type === 'blue-circle') ctx.strokeStyle = 'blue';
      
      ctx.arc(ann.x, ann.y, radius, 0, 2 * Math.PI);
    } else if (ann.type.includes('line') && ann.points && ann.points.length > 1) {
      ctx.lineWidth = 5;
      
      // Set color based on annotation type
      if (ann.type === 'yellow-line') ctx.strokeStyle = 'yellow';
      else if (ann.type === 'pink-line') ctx.strokeStyle = 'pink';
      
      ctx.moveTo(ann.points[0].x, ann.points[0].y);
      ctx.lineTo(ann.points[1].x, ann.points[1].y);
    }
    
    ctx.stroke();
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
              className="border rounded-md p-2 hover:shadow-md cursor-pointer"
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
          
          <div className="border rounded-md p-2 flex flex-col items-center justify-center bg-gray-50 h-64">
            <Button variant="ghost" className="flex-col h-full w-full">
              <Plus className="h-8 w-8 mb-2" />
              <span>Add New Photo</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Annotate Photo</h3>
            <Button variant="outline" onClick={closeAnnotationMode}>Close</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-1">
              <div className="space-y-4">
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
                    <h4 className="font-medium mb-2">Annotations</h4>
                    <div className="space-y-1 text-sm">
                      {selectedPhoto.annotations.map((ann, i) => (
                        <div key={i} className="p-2 border rounded">
                          <div className="font-medium">
                            {ann.type.replace('-', ' ')}
                          </div>
                          {ann.note && (
                            <div className="text-xs text-gray-600">
                              Note: {ann.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Instructions */}
                <div className="bg-blue-50 p-3 rounded-md mt-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Instructions:</h4>
                  <ul className="list-disc list-inside text-xs text-blue-800">
                    <li>Click on the image to place an annotation</li>
                    <li>For lines, click and drag to draw</li>
                    <li>Add a note after placing each annotation</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="col-span-4 relative">
              {selectedPhoto && (
                <>
                  <img
                    ref={imageRef}
                    src={selectedPhoto.src}
                    alt={selectedPhoto.alt}
                    className="w-full h-auto hidden"
                    onLoad={() => renderAnnotations()}
                  />
                  <canvas
                    ref={canvasRef}
                    className="border cursor-crosshair w-full"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                  
                  {showNoteDialog && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white p-4 rounded-md w-full max-w-md">
                        <h3 className="text-lg font-medium mb-3">Add Note (Optional)</h3>
                        <Textarea
                          placeholder="E.g., This tree is leaning toward the roof"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="min-h-[100px] mb-4"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={cancelAnnotation}>Cancel</Button>
                          <Button onClick={saveAnnotation}>Save Annotation</Button>
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
