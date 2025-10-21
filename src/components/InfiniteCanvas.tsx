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
import { InfiniteCanvasProps, Task, State, Link } from '../types'
import GridLayer from './GridLayer'
import TaskCard from './TaskCard'
import StateCard from './StateCard'
import LinkComponent from './Link'
import TaskEditorModal, { TaskEditorData } from './TaskEditorModal'
import StateEditorModal, { StateEditorData } from './StateEditorModal'
import ConfirmDialog from './ConfirmDialog'
import { snapPositionToGrid } from '../utils/snapToGrid'
import {
    VIEWPORT_DEFAULT_WIDTH,
    VIEWPORT_DEFAULT_HEIGHT,
    GRID_SPACING,
    CARD_WIDTH,
    CARD_HEIGHT,
    DEFAULTS,
    OFFSETS,
    VIEWPORT_ZOOM_FACTOR,
} from '../constants'
import './InfiniteCanvas.css'

export interface InfiniteCanvasRef {
    createTask: () => void
    createState: () => void
    duplicateTask: (taskId: string) => void
    duplicateState: (stateId: string) => void
    forkState: (stateId: string) => void
    clearCanvas: () => void
}

const InfiniteCanvas = forwardRef<InfiniteCanvasRef, InfiniteCanvasProps>(
    ({ width, height, className = '', onCreateTask }, ref) => {
        const stageRef = useRef<any>(null)
        const containerRef = useRef<HTMLDivElement>(null)
        const [dimensions, setDimensions] = useState({
            width: VIEWPORT_DEFAULT_WIDTH,
            height: VIEWPORT_DEFAULT_HEIGHT,
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
        const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
        const [editorOpen, setEditorOpen] = useState(false)

        // States state
        const [states, setStates] = useState<State[]>([])
        const [selectedStateId, setSelectedStateId] = useState<string | null>(
            null
        )
        const [editingStateId, setEditingStateId] = useState<string | null>(
            null
        )
        const [stateEditorOpen, setStateEditorOpen] = useState(false)

        // Links state
        const [links, setLinks] = useState<Link[]>([])
        const [selectedLinkId, setSelectedLinkId] = useState<string | null>(
            null
        )

        // Delete confirmation dialog state
        const [deleteConfirmation, setDeleteConfirmation] = useState<{
            isOpen: boolean
            itemId: string | null
            itemType: 'task' | 'state' | null
        }>({
            isOpen: false,
            itemId: null,
            itemType: null,
        })

        const viewport = useViewportState()

        // Expose createTask and createState functions to parent
        useImperativeHandle(ref, () => ({
            createTask,
            createState,
            duplicateTask,
            duplicateState,
            forkState,
            clearCanvas,
        }))

        // Handle container resize
        useEffect(() => {
            const updateDimensions = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect()
                    setDimensions({
                        width: width || rect.width || VIEWPORT_DEFAULT_WIDTH,
                        height: height || rect.height || VIEWPORT_DEFAULT_HEIGHT,
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
                if (!viewport.isDragging || !lastPointerPosition) {
                    return
                }

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
                    const scaleBy = VIEWPORT_ZOOM_FACTOR
                    const direction = deltaY > 0 ? -1 : 1
                    const newScale =
                        viewport.scale * Math.pow(scaleBy, direction)                        // Zoom to the pointer position
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

        const handleStatePositionChange = useCallback(
            (id: string, x: number, y: number) => {
                setStates((prevStates) =>
                    prevStates.map((state) =>
                        state.id === id ? { ...state, x, y } : state
                    )
                )
            },
            []
        )

        const handleTaskClick = useCallback((id: string) => {
            setSelectedTaskId(id)
            setSelectedStateId(null)
            setSelectedLinkId(null)
        }, [])

        const handleStateClick = useCallback((id: string) => {
            setSelectedStateId(id)
            setSelectedTaskId(null)
            setSelectedLinkId(null)
        }, [])

        const handleTaskDoubleClick = useCallback((id: string) => {
            setEditingTaskId(id)
            setEditorOpen(true)
        }, [])

        const handleStateDoubleClick = useCallback((id: string) => {
            setEditingStateId(id)
            setStateEditorOpen(true)
        }, [])

        const handleEditorSave = useCallback(
            (data: TaskEditorData) => {
                if (editingTaskId) {
                    setTasks((prevTasks) =>
                        prevTasks.map((task) =>
                            task.id === editingTaskId
                                ? {
                                      ...task,
                                      title: data.title,
                                      description: data.description,
                                      date: data.date,
                                      priority: data.priority,
                                  }
                                : task
                        )
                    )
                }
                setEditorOpen(false)
                setEditingTaskId(null)
            },
            [editingTaskId]
        )

        const handleEditorCancel = useCallback(() => {
            setEditorOpen(false)
            setEditingTaskId(null)
        }, [])

        const handleStateEditorSave = useCallback(
            (data: StateEditorData) => {
                if (editingStateId) {
                    setStates((prevStates) =>
                        prevStates.map((state) =>
                            state.id === editingStateId
                                ? {
                                      ...state,
                                      description: data.description,
                                      date: data.date,
                                      priority: data.priority,
                                  }
                                : state
                        )
                    )
                }
                setStateEditorOpen(false)
                setEditingStateId(null)
            },
            [editingStateId]
        )

        const handleStateEditorCancel = useCallback(() => {
            setStateEditorOpen(false)
            setEditingStateId(null)
        }, [])

        const handleStageClick = useCallback(
            (e: KonvaEventObject<MouseEvent>) => {
                // Deselect when clicking on stage
                const target = e.target
                if (target === e.target.getStage()) {
                    setSelectedTaskId(null)
                    setSelectedStateId(null)
                    setSelectedLinkId(null)
                }
            },
            []
        )

        // Link creation handlers - now creates state and links immediately
        const handleLinkStart = useCallback(
            (sourceId: string) => {
                // Find the source task
                const sourceTask = tasks.find((t) => t.id === sourceId)
                if (!sourceTask) return

                // Calculate offset position (240px to the right of the task)
                const offsetX = sourceTask.x + OFFSETS.LINK_STATE_CREATION_X
                const offsetY = sourceTask.y + OFFSETS.LINK_STATE_CREATION_Y

                // Snap to grid
                const snapped = snapPositionToGrid(
                    { x: offsetX, y: offsetY },
                    GRID_SPACING,
                    viewport.scale
                )

                // Create the new state
                const newState: State = {
                    id: `state-${Date.now()}`,
                    x: snapped.x,
                    y: snapped.y,
                    description: DEFAULTS.STATE_DESCRIPTION,
                    date: DEFAULTS.STATE_DATE,
                    priority: DEFAULTS.STATE_PRIORITY,
                }

                setStates((prevStates) => [...prevStates, newState])

                // Create the link from task to new state
                const newLink: Link = {
                    id: `link-${Date.now()}`,
                    sourceId: sourceId,
                    targetId: newState.id,
                    sourceType: 'task',
                    targetType: 'state',
                    linkStyle: DEFAULTS.LINK_STYLE,
                    routeAround: DEFAULTS.LINK_ROUTE_AROUND,
                }
                setLinks((prevLinks) => [...prevLinks, newLink])

                // Select the new state
                setSelectedStateId(newState.id)
                setSelectedTaskId(null)
            },
            [tasks, viewport.scale]
        )

        const handleLinkClick = useCallback((linkId: string) => {
            setSelectedLinkId(linkId)
            setSelectedTaskId(null)
            setSelectedStateId(null)
        }, [])

        const handleUpdateLinkStyle = useCallback(
            (linkId: string, style: 'free' | 'orthogonal') => {
                setLinks((prevLinks) =>
                    prevLinks.map((link) =>
                        link.id === linkId
                            ? { ...link, linkStyle: style }
                            : link
                    )
                )
            },
            []
        )

        const handleUpdateRouteAround = useCallback(
            (linkId: string, routeAround: boolean) => {
                setLinks((prevLinks) =>
                    prevLinks.map((link) =>
                        link.id === linkId
                            ? { ...link, routeAround: routeAround }
                            : link
                    )
                )
            },
            []
        )

        // Create task function
        const createTask = useCallback(() => {
            const stage = stageRef.current
            if (!stage) return

            // Calculate center of visible viewport in world coordinates
            const centerX = (dimensions.width / 2 - viewport.x) / viewport.scale
            const centerY =
                (dimensions.height / 2 - viewport.y) / viewport.scale

            // Snap to grid
            const snapped = snapPositionToGrid(
                { x: centerX, y: centerY },
                GRID_SPACING,
                viewport.scale
            )

            const newTask: Task = {
                id: `task-${Date.now()}`,
                x: snapped.x,
                y: snapped.y,
                title: DEFAULTS.TASK_TITLE,
                description: DEFAULTS.TASK_DESCRIPTION,
                date: DEFAULTS.TASK_DATE,
                priority: DEFAULTS.TASK_PRIORITY,
            }

            setTasks((prevTasks) => [...prevTasks, newTask])
            setSelectedTaskId(newTask.id)

            // Notify parent if callback provided
            if (onCreateTask) {
                onCreateTask()
            }
        }, [viewport, dimensions, onCreateTask])

        // Create state function
        const createState = useCallback(() => {
            const stage = stageRef.current
            if (!stage) return

            // Calculate center of visible viewport in world coordinates
            const centerX = (dimensions.width / 2 - viewport.x) / viewport.scale
            const centerY =
                (dimensions.height / 2 - viewport.y) / viewport.scale

            // Snap to grid
            const snapped = snapPositionToGrid(
                { x: centerX, y: centerY },
                GRID_SPACING,
                viewport.scale
            )

            const newState: State = {
                id: `state-${Date.now()}`,
                x: snapped.x,
                y: snapped.y,
                description: DEFAULTS.STATE_DESCRIPTION,
                date: DEFAULTS.STATE_DATE,
                priority: DEFAULTS.STATE_PRIORITY,
            }

            setStates((prevStates) => [...prevStates, newState])
            setSelectedStateId(newState.id)
        }, [viewport, dimensions])

        // Duplicate task function
        const duplicateTask = useCallback(
            (taskId: string) => {
                const taskToDuplicate = tasks.find((task) => task.id === taskId)
                if (!taskToDuplicate) return

                // Calculate offset position (40px down and right from original)
                const offsetX = taskToDuplicate.x + OFFSETS.DUPLICATE_X
                const offsetY = taskToDuplicate.y + OFFSETS.DUPLICATE_Y

                // Snap to grid
                const snapped = snapPositionToGrid(
                    { x: offsetX, y: offsetY },
                    GRID_SPACING,
                    viewport.scale
                )

                const newTask: Task = {
                    id: `task-${Date.now()}`,
                    x: snapped.x,
                    y: snapped.y,
                    title: taskToDuplicate.title,
                    description: taskToDuplicate.description,
                    date: taskToDuplicate.date,
                    priority: taskToDuplicate.priority,
                }

                setTasks((prevTasks) => [...prevTasks, newTask])
                setSelectedTaskId(newTask.id)
            },
            [tasks, viewport.scale]
        )

        // Duplicate state function
        const duplicateState = useCallback(
            (stateId: string) => {
                const stateToDuplicate = states.find(
                    (state) => state.id === stateId
                )
                if (!stateToDuplicate) return

                // Calculate offset position (40px down and right from original)
                const offsetX = stateToDuplicate.x + OFFSETS.DUPLICATE_X
                const offsetY = stateToDuplicate.y + OFFSETS.DUPLICATE_Y

                // Snap to grid
                const snapped = snapPositionToGrid(
                    { x: offsetX, y: offsetY },
                    GRID_SPACING,
                    viewport.scale
                )

                const newState: State = {
                    id: `state-${Date.now()}`,
                    x: snapped.x,
                    y: snapped.y,
                    description: stateToDuplicate.description,
                    date: stateToDuplicate.date,
                    priority: stateToDuplicate.priority,
                }

                setStates((prevStates) => [...prevStates, newState])
                setSelectedStateId(newState.id)
            },
            [states, viewport.scale]
        )

        // Fork state function - creates a new state linked from the source
        const forkState = useCallback(
            (stateId: string) => {
                const sourceState = states.find((state) => state.id === stateId)
                if (!sourceState) return

                // Calculate offset position (40px down and right from original)
                const offsetX = sourceState.x + OFFSETS.DUPLICATE_X
                const offsetY = sourceState.y + OFFSETS.DUPLICATE_Y

                // Snap to grid
                const snapped = snapPositionToGrid(
                    { x: offsetX, y: offsetY },
                    GRID_SPACING,
                    viewport.scale
                )

                const newState: State = {
                    id: `state-${Date.now()}`,
                    x: snapped.x,
                    y: snapped.y,
                    description: sourceState.description,
                    date: sourceState.date,
                    priority: sourceState.priority,
                }

                // Create the state
                setStates((prevStates) => [...prevStates, newState])

                // Create a link from source state to new state
                const newLink: Link = {
                    id: `link-${Date.now()}`,
                    sourceId: stateId,
                    targetId: newState.id,
                    sourceType: 'state',
                    targetType: 'state',
                    linkStyle: DEFAULTS.LINK_STYLE,
                    routeAround: DEFAULTS.LINK_ROUTE_AROUND,
                }
                setLinks((prevLinks) => [...prevLinks, newLink])

                // Focus the new state
                setSelectedStateId(newState.id)
            },
            [states, viewport.scale]
        )

        // Clear canvas function - removes all tasks, states, and links
        const clearCanvas = useCallback(() => {
            setTasks([])
            setStates([])
            setLinks([])
            setSelectedTaskId(null)
            setSelectedStateId(null)
            setSelectedLinkId(null)
        }, [])

        // Handle delete request (opens confirmation dialog)
        const handleDeleteRequest = useCallback((id: string) => {
            // Check if it's a task or state based on ID prefix
            const itemType = id.startsWith('task-') ? 'task' : 'state'
            setDeleteConfirmation({
                isOpen: true,
                itemId: id,
                itemType,
            })
        }, [])

        // Confirm deletion
        const handleDeleteConfirm = useCallback(() => {
            if (deleteConfirmation.itemId && deleteConfirmation.itemType) {
                if (deleteConfirmation.itemType === 'task') {
                    setTasks((prevTasks) =>
                        prevTasks.filter(
                            (task) => task.id !== deleteConfirmation.itemId
                        )
                    )
                    // Clear selection if deleted task was selected
                    if (selectedTaskId === deleteConfirmation.itemId) {
                        setSelectedTaskId(null)
                    }
                } else if (deleteConfirmation.itemType === 'state') {
                    setStates((prevStates) =>
                        prevStates.filter(
                            (state) => state.id !== deleteConfirmation.itemId
                        )
                    )
                    // Clear selection if deleted state was selected
                    if (selectedStateId === deleteConfirmation.itemId) {
                        setSelectedStateId(null)
                    }
                }
            }
            setDeleteConfirmation({
                isOpen: false,
                itemId: null,
                itemType: null,
            })
        }, [
            deleteConfirmation.itemId,
            deleteConfirmation.itemType,
            selectedTaskId,
            selectedStateId,
        ])

        // Cancel deletion
        const handleDeleteCancel = useCallback(() => {
            setDeleteConfirmation({
                isOpen: false,
                itemId: null,
                itemType: null,
            })
        }, [])

        // Handle keyboard shortcuts
        useEffect(() => {
            const handleKeyDown = (e: KeyboardEvent) => {
                // Ctrl+D (Windows/Linux) or Cmd+D (Mac) to duplicate selected card
                if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                    e.preventDefault()
                    if (selectedTaskId) {
                        duplicateTask(selectedTaskId)
                    } else if (selectedStateId) {
                        duplicateState(selectedStateId)
                    }
                }
            }

            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }, [selectedTaskId, selectedStateId, duplicateTask, duplicateState])

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

                    {/* Links layer - rendered above grid but behind cards */}
                    <Layer>
                        {links.map((link) => {
                            // Find source card (could be Task or State)
                            const sourceCard =
                                link.sourceType === 'task'
                                    ? tasks.find((t) => t.id === link.sourceId)
                                    : states.find((s) => s.id === link.sourceId)

                            // Find target card (could be Task or State)
                            const targetCard =
                                link.targetType === 'task'
                                    ? tasks.find((t) => t.id === link.targetId)
                                    : states.find((s) => s.id === link.targetId)

                            if (!sourceCard || !targetCard) return null

                            // Determine dimensions based on card type
                            const sourceWidth = CARD_WIDTH
                            const sourceHeight = CARD_HEIGHT
                            const targetWidth = CARD_WIDTH
                            const targetHeight = CARD_HEIGHT

                            // Collect all card positions for route-around
                            const allCards = [
                                ...tasks.map((t) => ({
                                    x: t.x,
                                    y: t.y,
                                    width: CARD_WIDTH,
                                    height: CARD_HEIGHT,
                                })),
                                ...states.map((s) => ({
                                    x: s.x,
                                    y: s.y,
                                    width: CARD_WIDTH,
                                    height: CARD_HEIGHT,
                                })),
                            ]

                            return (
                                <LinkComponent
                                    key={link.id}
                                    id={link.id}
                                    sourceX={sourceCard.x}
                                    sourceY={sourceCard.y}
                                    sourceWidth={sourceWidth}
                                    sourceHeight={sourceHeight}
                                    targetX={targetCard.x}
                                    targetY={targetCard.y}
                                    targetWidth={targetWidth}
                                    targetHeight={targetHeight}
                                    linkStyle={link.linkStyle || 'free'}
                                    routeAround={link.routeAround || false}
                                    isSelected={link.id === selectedLinkId}
                                    onClick={handleLinkClick}
                                    onUpdateLinkStyle={handleUpdateLinkStyle}
                                    onUpdateRouteAround={
                                        handleUpdateRouteAround
                                    }
                                    allCards={allCards}
                                />
                            )
                        })}
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
                                gridSpacing={GRID_SPACING}
                                scale={viewport.scale}
                                isSelected={task.id === selectedTaskId}
                                onPositionChange={handleCardPositionChange}
                                onClick={handleTaskClick}
                                onDoubleClick={handleTaskDoubleClick}
                                onDelete={handleDeleteRequest}
                                onDuplicate={duplicateTask}
                                onLinkStart={handleLinkStart}
                            />
                        ))}
                        {states.map((state) => {
                            return (
                                <StateCard
                                    key={state.id}
                                    id={state.id}
                                    x={state.x}
                                    y={state.y}
                                    description={state.description}
                                    date={state.date}
                                    priority={state.priority}
                                    gridSpacing={GRID_SPACING}
                                    scale={viewport.scale}
                                    isSelected={state.id === selectedStateId}
                                    onPositionChange={handleStatePositionChange}
                                    onClick={handleStateClick}
                                    onDoubleClick={handleStateDoubleClick}
                                    onDelete={handleDeleteRequest}
                                    onDuplicate={duplicateState}
                                    onFork={forkState}
                                />
                            )
                        })}
                    </Layer>
                </Stage>

                {/* Task Editor Modal */}
                {editingTaskId && (
                    <TaskEditorModal
                        isOpen={editorOpen}
                        taskData={{
                            title:
                                tasks.find((t) => t.id === editingTaskId)
                                    ?.title || '',
                            description: tasks.find(
                                (t) => t.id === editingTaskId
                            )?.description,
                            date: tasks.find((t) => t.id === editingTaskId)
                                ?.date,
                            priority:
                                tasks.find((t) => t.id === editingTaskId)
                                    ?.priority || 'Medium',
                        }}
                        onSave={handleEditorSave}
                        onCancel={handleEditorCancel}
                    />
                )}

                {/* State Editor Modal */}
                {editingStateId && (
                    <StateEditorModal
                        isOpen={stateEditorOpen}
                        stateData={{
                            description:
                                states.find((s) => s.id === editingStateId)
                                    ?.description || '',
                            date: states.find((s) => s.id === editingStateId)
                                ?.date,
                            priority:
                                states.find((s) => s.id === editingStateId)
                                    ?.priority || 'Medium',
                        }}
                        onSave={handleStateEditorSave}
                        onCancel={handleStateEditorCancel}
                    />
                )}

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
                    title={
                        deleteConfirmation.itemType === 'state'
                            ? 'Delete State'
                            : 'Delete Task'
                    }
                    message={
                        deleteConfirmation.itemType === 'state'
                            ? 'Are you sure you want to delete this state? This action cannot be undone.'
                            : 'Are you sure you want to delete this task? This action cannot be undone.'
                    }
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
