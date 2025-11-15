export interface ViewportState {
    x: number
    y: number
    scale: number
    isDragging: boolean
}

export interface ViewportActions {
    updatePosition: (x: number, y: number) => void
    updateScale: (scale: number) => void
    setDragging: (isDragging: boolean) => void
    zoomToPoint: (point: { x: number; y: number }, newScale: number) => void
}

export interface InfiniteCanvasProps {
    width?: number
    height?: number
    className?: string
    onCreateTask?: () => void
    debugMode?: boolean
    showAlternativePaths?: boolean
}

export interface GridLayerProps {
    x: number
    y: number
    scale: number
    width: number
    height: number
    gridSpacing?: number
    dotColor?: string
    dotRadius?: number
}

export interface Task {
    id: string
    x: number
    y: number
    title: string
    description?: string
    date?: string
    priority?: 'Low' | 'Medium' | 'High'
}

export interface State {
    id: string
    x: number
    y: number
    description: string
    date?: string
    priority?: 'Low' | 'Medium' | 'High'
}

export interface Link {
    id: string
    sourceId: string
    targetId: string
    sourceType: 'task' | 'state'
    targetType: 'task' | 'state'
    linkStyle?: 'free' | 'orthogonal'
    routeAround?: boolean
}

export interface CanvasData {
    id: string
    name: string
    tasks: Task[]
    states: State[]
    links: Link[]
    createdAt: string
    updatedAt: string
}

export interface CanvasMetadata {
    id: string
    name: string
    createdAt: string
    updatedAt: string
}
