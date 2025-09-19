import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useViewportState } from '../hooks/useViewportState';
import { InfiniteCanvasProps } from '../types';
import './InfiniteCanvas.css';

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  width,
  height,
  className = '',
}) => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [lastPointerPosition, setLastPointerPosition] = useState<{ x: number; y: number } | null>(null);
  
  const viewport = useViewportState();

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width || rect.width || 800,
          height: height || rect.height || 600,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [width, height]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      setLastPointerPosition(pos);
      viewport.setDragging(true);
    }
  }, [viewport]);

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!viewport.isDragging || !lastPointerPosition) return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    
    if (pos) {
      const dx = pos.x - lastPointerPosition.x;
      const dy = pos.y - lastPointerPosition.y;
      
      // Update viewport position based on delta movement
      viewport.updatePosition(viewport.x + dx, viewport.y + dy);
      setLastPointerPosition(pos);
    }
  }, [viewport, lastPointerPosition]);

  const handleMouseUp = useCallback(() => {
    viewport.setDragging(false);
    setLastPointerPosition(null);
  }, [viewport]);

  const handleMouseLeave = useCallback(() => {
    viewport.setDragging(false);
    setLastPointerPosition(null);
  }, [viewport]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault();
    const touch = e.evt.touches[0];
    if (touch) {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (pos) {
        setLastPointerPosition(pos);
        viewport.setDragging(true);
      }
    }
  }, [viewport]);

  const handleTouchMove = useCallback((e: KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault();
    if (!viewport.isDragging || !lastPointerPosition) return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    
    if (pos) {
      const dx = pos.x - lastPointerPosition.x;
      const dy = pos.y - lastPointerPosition.y;
      
      viewport.updatePosition(viewport.x + dx, viewport.y + dy);
      setLastPointerPosition(pos);
    }
  }, [viewport, lastPointerPosition]);

  const handleTouchEnd = useCallback(() => {
    viewport.setDragging(false);
    setLastPointerPosition(null);
  }, [viewport]);

  return (
    <div 
      ref={containerRef}
      className={`infinite-canvas-container ${className}`}
      style={{ cursor: viewport.isDragging ? 'grabbing' : 'grab' }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        draggable={false} // We handle dragging manually
      >
        <Layer>
          {/* Content will be added here in future stories */}
        </Layer>
      </Stage>
      
      {/* Development mode coordinate display */}
      {process.env.NODE_ENV === 'development' && (
        <div className="viewport-debug">
          <div>Position: ({viewport.x.toFixed(1)}, {viewport.y.toFixed(1)})</div>
          <div>Scale: {viewport.scale.toFixed(2)}</div>
          <div>Dragging: {viewport.isDragging ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default InfiniteCanvas;