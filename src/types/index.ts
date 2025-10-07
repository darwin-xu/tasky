export interface ViewportState {
  x: number;
  y: number;
  scale: number;
  isDragging: boolean;
}

export interface ViewportActions {
  updatePosition: (x: number, y: number) => void;
  updateScale: (scale: number) => void;
  setDragging: (isDragging: boolean) => void;
  zoomToPoint: (point: { x: number; y: number }, newScale: number) => void;
}

export interface InfiniteCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

export interface GridLayerProps {
  x: number;
  y: number;
  scale: number;
  width: number;
  height: number;
  gridSpacing?: number;
  dotColor?: string;
  dotRadius?: number;
}