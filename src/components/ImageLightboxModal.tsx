import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productTitle: string;
  productCode?: string;
  whatsappUrl?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productTitle,
  productCode,
  whatsappUrl,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Sync initialIndex when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation & escape to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (images.length > 1) {
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
          setZoomLevel(1);
          setPanPosition({ x: 0, y: 0 });
        }
      } else if (e.key === 'ArrowRight') {
        if (images.length > 1) {
          setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
          setZoomLevel(1);
          setPanPosition({ x: 0, y: 0 });
        }
      }
    },
    [isOpen, images.length, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleToggleZoom = () => {
    if (zoomLevel > 1) {
      handleResetZoom();
    } else {
      setZoomLevel(2);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="p-3 sm:p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#DFBA73]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="max-w-[200px] sm:max-w-md">
            <h3 className="font-serif text-sm sm:text-base font-bold truncate text-[#FFF0F3]">
              {productTitle}
            </h3>
            {productCode && (
              <span className="text-[10px] sm:text-xs text-[#DFBA73] font-mono">
                Ref: {productCode}
              </span>
            )}
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white/10 border border-white/20 rounded-full px-1.5 py-0.5">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 text-white/80 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1 text-white/90">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1.5 text-white/80 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-white/80 hover:text-white cursor-pointer ml-0.5 border-l border-white/20"
                title="Redefinir Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Fechar visualização ampliada"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden p-2 sm:p-6"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                setZoomLevel(1);
                setPanPosition({ x: 0, y: 0 });
              }}
              className="absolute left-2 sm:left-6 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/30 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                setZoomLevel(1);
                setPanPosition({ x: 0, y: 0 });
              }}
              className="absolute right-2 sm:right-6 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/30 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* The Zoomed Image */}
        <div
          className={`relative max-w-full max-h-[75vh] flex items-center justify-center transition-transform ${
            isDragging ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'
          }`}
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          onClick={handleToggleZoom}
        >
          <img
            src={currentImage}
            alt={productTitle}
            className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl drop-shadow-2xl border border-white/10"
            draggable={false}
          />
        </div>

        {/* Double-click or click to zoom hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white/80 text-[11px] backdrop-blur-xs border border-white/15 pointer-events-none">
          {zoomLevel > 1 ? 'Arraste para mover • Clique para diminuir' : 'Clique na foto para ampliar os detalhes'}
        </div>
      </div>

      {/* Bottom Bar: Thumbnails & WhatsApp Button */}
      <div
        className="p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/80 to-transparent flex flex-col sm:flex-row items-center justify-between gap-3 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thumbnails */}
        {images.length > 1 ? (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoomLevel(1);
                  setPanPosition({ x: 0, y: 0 });
                }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  currentIndex === idx
                    ? 'border-[#DFBA73] scale-105 shadow-md shadow-[#DFBA73]/30'
                    : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
            <span className="text-white/60 text-xs ml-2 font-mono">
              {currentIndex + 1} de {images.length}
            </span>
          </div>
        ) : (
          <div className="text-white/60 text-xs font-serif italic">
            Visualização ampliada em alta resolução
          </div>
        )}

        {/* WhatsApp Direct Buy Link */}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Pedir Peça no WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
};
