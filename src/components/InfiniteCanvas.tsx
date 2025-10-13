import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
    useImperativeHandle,
    forwardRef,
} from 'react'
import { Stage, Layer } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { useViewportState } from '../hooks/useViewportState'
import { InfiniteCanvasProps, Task } from '../types'
import GridLayer from './GridLayer'
import TaskCard from './TaskCard'
import ConfirmDialog from './ConfirmDialog'
import { snapPositionToGrid } from '../utils/snapToGrid'
import './InfiniteCanvas.css'

export interface InfiniteCanvasRef {
    createTask: () => void
}

const InfiniteCanvas = forwardRef<InfiniteCanvasRef, InfiniteCanvasProps>(
    ({ width, height, className = '', onCreateTask }, ref) => {
        const stageRef = useRef<any>(null)
        const containerRef = useRef<HTMLDivElement>(null)
        const [dimensions, setDimensions] = useState({
            width: 800,
            height: 600,
        })
        const [lastPointerPosition, setLastPointerPosition] = useState<{
            x: number
            y: number
        } | null>(null)

        // Tasks state
        const [tasks, setTasks] = useState<Task[]>([])
        const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
            null
        )

        // Delete confirmation dialog state
        const [deleteConfirmation, setDeleteConfirmation] = useState<{
            isOpen: boolean
            taskId: string | null
        }>({
            isOpen: false,
            taskId: null,
        })

        const viewport = useViewportState()

        // Expose createTask function to parent
        useImperativeHandle(ref, () => ({
            createTask,
        }))

        // Handle container resize
        useEffect(() => {
            const updateDimensions = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect()
                    setDimensions({
                        width: width || rect.width || 800,
                        height: height || rect.height || 600,
                    })
                }
            }

            updateDimensions()
            window.addEventListener('resize', updateDimensions)

            return () => {
                window.removeEventListener('resize', updateDimensions)
            }
        }, [width, height])

        // Mouse event handlers
        const handleMouseDown = useCallback(
            (e: KonvaEventObject<MouseEvent>) => {
                // Only start panning if we clicked on the stage itself (not a draggable card)
                const target = e.target
                if (target === e.target.getStage()) {
                    const pos = e.target.getStage()?.getPointerPosition()
                    if (pos) {
                        setLastPointerPosition(pos)
                        viewport.setDragging(true)
                    }
                }
            },
            [viewport]
        )

        const handleMouseMove = useCallback(
            (e: KonvaEventObject<MouseEvent>) => {
                if (!viewport.isDragging || !lastPointerPosition) return

                const stage = e.target.getStage()
                const pos = stage?.getPointerPosition()

                if (pos) {
                    const dx = pos.x - lastPointerPosition.x
                    const dy = pos.y - lastPointerPosition.y

                    // Update viewport position based on delta movement
                    viewport.updatePosition(viewport.x + dx, viewport.y + dy)
                    setLastPointerPosition(pos)
                }
            },
            [viewport, lastPointerPosition]
        )

        const handleMouseUp = useCallback(() => {
            viewport.setDragging(false)
            setLastPointerPosition(null)
        }, [viewport])

        const handleMouseLeave = useCallback(() => {
            viewport.setDragging(false)
            setLastPointerPosition(null)
        }, [viewport])

        // Touch event handlers for mobile support
        const handleTouchStart = useCallback(
            (e: KonvaEventObject<TouchEvent>) => {
                e.evt.preventDefault()
                const target = e.target
                // Only start panning if we touched the stage itself (not a draggable card)
                if (target === e.target.getStage()) {
                    const touch = e.evt.touches[0]
                    if (touch) {
                        const stage = e.target.getStage()
                        const pos = stage?.getPointerPosition()
                        if (pos) {
                            setLastPointerPosition(pos)
                            viewport.setDragging(true)
                        }
                    }
                }
            },
            [viewport]
        )

        const handleTouchMove = useCallback(
            (e: KonvaEventObject<TouchEvent>) => {
                e.evt.preventDefault()
                if (!viewport.isDragging || !lastPointerPosition) return

                const stage = e.target.getStage()
                const pos = stage?.getPointerPosition()

                if (pos) {
                    const dx = pos.x - lastPointerPosition.x
                    const dy = pos.y - lastPointerPosition.y

                    viewport.updatePosition(viewport.x + dx, viewport.y + dy)
                    setLastPointerPosition(pos)
                }
            },
            [viewport, lastPointerPosition]
        )

        const handleTouchEnd = useCallback(() => {
            viewport.setDragging(false)
            setLastPointerPosition(null)
        }, [viewport])

        // Wheel event handler for trackpad panning and zooming
        const handleWheel = useCallback(
            (e: KonvaEventObject<WheelEvent>) => {
                e.evt.preventDefault() // Prevent page scrolling

                const { deltaX, deltaY, ctrlKey, metaKey } = e.evt

                // Check if Ctrl (Windows/Linux) or Cmd (Mac) is pressed for zooming
                if (ctrlKey || metaKey) {
                    // Zooming
                    const stage = e.target.getStage()
                    const pointerPos = stage?.getPointerPosition()

                    if (pointerPos) {
                        // Calculate zoom factor based on deltaY
                        const scaleBy = 1.05
                        const direction = deltaY > 0 ? -1 : 1
                        const newScale =
                            viewport.scale * Math.pow(scaleBy, direction)

                        // Zoom to the pointer position
                        viewport.zoomToPoint(pointerPos, newScale)
                    }
                } else {
                    // Panning
                    // Update viewport position by adding delta values
                    viewport.updatePosition(
                        viewport.x + deltaX,
                        viewport.y + deltaY
                    )
                }
            },
            [viewport]
        )

        const handleCardPositionChange = useCallback(
            (id: string, x: number, y: number) => {
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === id ? { ...task, x, y } : task
                    )
                )
            },
            []
        )

        const handleTaskClick = useCallback((id: string) => {
            setSelectedTaskId(id)
        }, [])

        const handleStageClick = useCallback(
            (e: KonvaEventObject<MouseEvent>) => {
                // Deselect when clicking on stage
                const target = e.target
                if (target === e.target.getStage()) {
                    setSelectedTaskId(null)
                }
            },
            []
        )

        // Create task function
        const createTask = useCallback(() => {
            const stage = stageRef.current
            if (!stage) return

            // Calculate center of visible viewport in world coordinates
            const centerX = (dimensions.width / 2 - viewport.x) / viewport.scale
            const centerY = (dimensions.height / 2 - viewport.y) / viewport.scale

            // Snap to grid
            const snapped = snapPositionToGrid(
                { x: centerX, y: centerY },
                20,
                viewport.scale
            )

            const newTask: Task = {
                id: `task-${Date.now()}`,
                x: snapped.x,
                y: snapped.y,
                title: 'New Task',
                description: '',
                date: '',
                priority: 'Medium',
            }

            setTasks((prevTasks) => [...prevTasks, newTask])
            setSelectedTaskId(newTask.id)

            // Notify parent if callback provided
            if (onCreateTask) {
                onCreateTask()
            }
        }, [viewport, dimensions, onCreateTask])

        // Handle delete request (opens confirmation dialog)
        const handleDeleteRequest = useCallback((taskId: string) => {
            setDeleteConfirmation({
                isOpen: true,
                taskId,
            })
        }, [])

        // Confirm deletion
        const handleDeleteConfirm = useCallback(() => {
            if (deleteConfirmation.taskId) {
                setTasks((prevTasks) =>
                    prevTasks.filter(
                        (task) => task.id !== deleteConfirmation.taskId
                    )
                )
                // Clear selection if deleted task was selected
                if (selectedTaskId === deleteConfirmation.taskId) {
                    setSelectedTaskId(null)
                }
            }
            setDeleteConfirmation({ isOpen: false, taskId: null })
        }, [deleteConfirmation.taskId, selectedTaskId])

        // Cancel deletion
        const handleDeleteCancel = useCallback(() => {
            setDeleteConfirmation({ isOpen: false, taskId: null })
        }, [])

        return (
            <div
                ref={containerRef}
                className={`infinite-canvas-container ${className}`}
                data-testid="infinite-canvas-container"
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
                    onWheel={handleWheel}
                    onClick={handleStageClick}
                    draggable={false} // We handle dragging manually
                >
                    {/* Grid layer - rendered behind content */}
                    <Layer>
                        <GridLayer
                            x={viewport.x}
                            y={viewport.y}
                            scale={viewport.scale}
                            width={dimensions.width}
                            height={dimensions.height}
                        />
                    </Layer>

                    {/* Main content layer */}
                    <Layer>
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                id={task.id}
                                x={task.x}
                                y={task.y}
                                title={task.title}
                                description={task.description}
                                date={task.date}
                                priority={task.priority}
                                gridSpacing={20}
                                scale={viewport.scale}
                                isSelected={task.id === selectedTaskId}
                                onPositionChange={handleCardPositionChange}
                                onClick={handleTaskClick}
                                onDelete={handleDeleteRequest}
                            />
                        ))}
                    </Layer>
                </Stage>

                {/* Development mode coordinate display */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="viewport-debug">
                        <div>
                            Position: ({viewport.x.toFixed(1)},{' '}
                            {viewport.y.toFixed(1)})
                        </div>
                        <div>Scale: {viewport.scale.toFixed(2)}</div>
                        <div>
                            Dragging: {viewport.isDragging ? 'Yes' : 'No'}
                        </div>
                    </div>
                )}

                {/* Delete confirmation dialog */}
                <ConfirmDialog
                    isOpen={deleteConfirmation.isOpen}
                    title="Delete Task"
                    message="Are you sure you want to delete this task? This action cannot be undone."
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                />
            </div>
        )
    }
)

InfiniteCanvas.displayName = 'InfiniteCanvas'

export default InfiniteCanvas
