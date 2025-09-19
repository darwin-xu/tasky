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
}

export interface InfiniteCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}