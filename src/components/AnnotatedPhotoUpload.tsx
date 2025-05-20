
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Circle, CircleDot, CircleX, Pencil, Plus } from "lucide-react";

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

const demoPhotos: Photo[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1472396961693-142e6e269027',
    alt: 'Property view with trees',
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const openAnnotationMode = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsAnnotating(true);
  };

  const closeAnnotationMode = () => {
    setSelectedPhoto(null);
    setIsAnnotating(false);
    setCurrentAnnotation(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedPhoto) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
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
      // For circles, we immediately save the annotation
      saveAnnotation(newAnnotation);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentAnnotation || !annotationType.includes('line')) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update current line annotation
    if (currentAnnotation.points && currentAnnotation.points.length === 1) {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...currentAnnotation.points, { x, y }]
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (currentAnnotation && annotationType.includes('line') && currentAnnotation.points && currentAnnotation.points.length > 1) {
      saveAnnotation(currentAnnotation);
    }
  };

  const saveAnnotation = (annotation: AnnotationType) => {
    if (!selectedPhoto) return;
    
    // Prompt for note
    const note = prompt("Add a note to this annotation (optional):");
    
    const updatedAnnotation = { ...annotation, note: note || undefined };
    
    // Save annotation to the photo
    const updatedPhotos = photos.map(photo => {
      if (photo.id === selectedPhoto.id) {
        return {
          ...photo,
          annotations: [...photo.annotations, updatedAnnotation]
        };
      }
      return photo;
    });
    
    setPhotos(updatedPhotos);
    setCurrentAnnotation(null);
  };

  const renderAnnotations = () => {
    if (!canvasRef.current || !selectedPhoto || !imageRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas and draw image
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw all saved annotations
    selectedPhoto.annotations.forEach(ann => {
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
    });
    
    // Draw current annotation if exists
    if (currentAnnotation) {
      ctx.beginPath();
      
      if (currentAnnotation.type.includes('circle')) {
        const radius = (currentAnnotation.width || 40) / 2;
        
        // Set color based on annotation type
        if (currentAnnotation.type === 'green-circle') ctx.strokeStyle = 'green';
        else if (currentAnnotation.type === 'red-circle') ctx.strokeStyle = 'red';
        else if (currentAnnotation.type === 'blue-circle') ctx.strokeStyle = 'blue';
        
        ctx.arc(currentAnnotation.x, currentAnnotation.y, radius, 0, 2 * Math.PI);
      } else if (currentAnnotation.type.includes('line') && currentAnnotation.points) {
        ctx.lineWidth = 5;
        
        // Set color based on annotation type
        if (currentAnnotation.type === 'yellow-line') ctx.strokeStyle = 'yellow';
        else if (currentAnnotation.type === 'pink-line') ctx.strokeStyle = 'pink';
        
        ctx.moveTo(currentAnnotation.points[0].x, currentAnnotation.points[0].y);
        
        if (currentAnnotation.points.length > 1) {
          ctx.lineTo(currentAnnotation.points[1].x, currentAnnotation.points[1].y);
        }
      }
      
      ctx.stroke();
    }
  };

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
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="annotationType" 
                        checked={annotationType === 'green-circle'}
                        onChange={() => setAnnotationType('green-circle')}
                        className="text-green-500"
                      />
                      <span className="flex items-center">
                        <Circle className="h-4 w-4 text-green-500 mr-1" /> 
                        <span className="text-sm">Green Circle - Trees to cut</span>
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="annotationType" 
                        checked={annotationType === 'red-circle'}
                        onChange={() => setAnnotationType('red-circle')}
                        className="text-red-500"
                      />
                      <span className="flex items-center">
                        <Circle className="h-4 w-4 text-red-500 mr-1" /> 
                        <span className="text-sm">Red Circle - Trees not to cut</span>
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="annotationType" 
                        checked={annotationType === 'blue-circle'}
                        onChange={() => setAnnotationType('blue-circle')}
                        className="text-blue-500"
                      />
                      <span className="flex items-center">
                        <Circle className="h-4 w-4 text-blue-500 mr-1" /> 
                        <span className="text-sm">Blue Circle - Machine placement</span>
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="annotationType" 
                        checked={annotationType === 'yellow-line'}
                        onChange={() => setAnnotationType('yellow-line')}
                        className="text-yellow-500"
                      />
                      <span className="flex items-center">
                        <span className="h-[2px] w-4 bg-yellow-500 mr-1"></span>
                        <span className="text-sm">Yellow Line - Path to house</span>
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="annotationType" 
                        checked={annotationType === 'pink-line'}
                        onChange={() => setAnnotationType('pink-line')}
                        className="text-pink-500"
                      />
                      <span className="flex items-center">
                        <span className="h-[2px] w-4 bg-pink-500 mr-1"></span>
                        <span className="text-sm">Pink Line - Alternate path</span>
                      </span>
                    </label>
                  </div>
                </div>
                
                {selectedPhoto?.annotations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Annotations</h4>
                    <div className="space-y-1 text-sm">
                      {selectedPhoto.annotations.map((ann, i) => (
                        <div key={i} className="p-1 border rounded">
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
              </div>
            </div>
            
            <div className="col-span-4 relative">
              {selectedPhoto && (
                <>
                  <img
                    ref={imageRef}
                    src={selectedPhoto.src}
                    alt={selectedPhoto.alt}
                    className="w-full h-auto"
                    style={{ display: 'none' }}
                    onLoad={() => {
                      if (imageRef.current && canvasRef.current) {
                        canvasRef.current.width = imageRef.current.width;
                        canvasRef.current.height = imageRef.current.height;
                        renderAnnotations();
                      }
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="border cursor-crosshair"
                    onClick={handleCanvasClick}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                  />
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
