import React, { useRef, useState, useEffect } from 'react'
import InfiniteCanvas, { InfiniteCanvasRef } from './components/InfiniteCanvas'
import Taskbar from './components/Taskbar'
import SaveCanvasModal from './components/SaveCanvasModal'
import LoadCanvasModal from './components/LoadCanvasModal'
import UnsavedChangesDialog from './components/UnsavedChangesDialog'
import './App.css'
import {
    saveCanvas,
    getCanvas,
    deleteCanvas,
    getCurrentCanvasId,
    clearCurrentCanvasId,
    listCanvases,
} from './services/canvasService'

function App() {
    const canvasRef = useRef<InfiniteCanvasRef>(null)
    const [currentCanvasId, setCurrentCanvasId] = useState<string | null>(null)
    const [currentCanvasName, setCurrentCanvasName] = useState<string>('')
    const [saveModalOpen, setSaveModalOpen] = useState(false)
    const [loadModalOpen, setLoadModalOpen] = useState(false)
    const [unsavedChangesDialog, setUnsavedChangesDialog] = useState<{
        isOpen: boolean
        action: 'load' | 'clear' | null
        pendingCanvasId?: string
    }>({
        isOpen: false,
        action: null,
    })
    const [pendingActionAfterSave, setPendingActionAfterSave] = useState<{
        action: 'load' | 'clear'
        canvasId?: string
    } | null>(null)

    // Load the last canvas on mount
    useEffect(() => {
        const canvasId = getCurrentCanvasId()
        if (canvasId) {
            const canvas = getCanvas(canvasId)
            if (canvas) {
                canvasRef.current?.loadCanvasState(
                    canvas.tasks,
                    canvas.states,
                    canvas.links
                )
                setCurrentCanvasId(canvas.id)
                setCurrentCanvasName(canvas.name)
            }
        }
    }, [])

    const handleCreateTask = () => {
        canvasRef.current?.createTask()
    }

    const handleSaveCanvas = () => {
        // AC2: If canvas already has a saved name, save directly without showing modal
        // AC5: If the original saved file is deleted, revert to prompting for new name
        if (currentCanvasId && currentCanvasName) {
            // Check if the canvas still exists in storage
            const existingCanvas = getCanvas(currentCanvasId)
            if (existingCanvas) {
                // Canvas exists, save directly
                performSaveCanvas(currentCanvasName, currentCanvasId)
                return
            } else {
                // Canvas was deleted, clear the current canvas ID and show modal
                setCurrentCanvasId(null)
                setCurrentCanvasName('')
                clearCurrentCanvasId()
            }
        }
        // AC1: First save - show modal to get name
        setSaveModalOpen(true)
    }

    const handleSaveAsCanvas = () => {
        // AC3: Save As - always show modal for new name
        setSaveModalOpen(true)
    }

    const performSaveCanvas = (name: string, canvasId?: string) => {
        const canvasState = canvasRef.current?.getCanvasState()
        if (!canvasState) return

        try {
            const savedCanvas = saveCanvas(
                {
                    name,
                    tasks: canvasState.tasks,
                    states: canvasState.states,
                    links: canvasState.links,
                },
                canvasId || undefined
            )

            if (savedCanvas) {
                setCurrentCanvasId(savedCanvas.id)
                setCurrentCanvasName(savedCanvas.name)
                canvasRef.current?.markClean()
                alert(`Canvas "${name}" saved successfully!`)
                resumePendingAction()
            } else {
                alert('Failed to save canvas.')
            }
        } catch (error) {
            console.error('Error saving canvas:', error)
            alert('An error occurred while saving the canvas.')
        }
    }

    const handleSaveCanvasConfirm = (name: string) => {
        performSaveCanvas(name, currentCanvasId || undefined)
        setSaveModalOpen(false)
    }

    const handleLoadCanvas = () => {
        setLoadModalOpen(true)
    }

    const handleLoadCanvasConfirm = (canvasId: string) => {
        // Check if there are unsaved changes
        if (canvasRef.current?.isDirty()) {
            setUnsavedChangesDialog({
                isOpen: true,
                action: 'load',
                pendingCanvasId: canvasId,
            })
            return
        }

        // No unsaved changes, proceed with loading
        performLoadCanvas(canvasId)
        setLoadModalOpen(false)
    }

    const performLoadCanvas = (canvasId: string) => {
        const canvas = getCanvas(canvasId)
        if (canvas) {
            canvasRef.current?.loadCanvasState(
                canvas.tasks,
                canvas.states,
                canvas.links
            )
            setCurrentCanvasId(canvas.id)
            setCurrentCanvasName(canvas.name)
            alert(`Canvas "${canvas.name}" loaded successfully!`)
        } else {
            alert('Failed to load canvas.')
        }
    }

    const handleClearCanvas = () => {
        // Check if there are unsaved changes
        if (canvasRef.current?.isDirty()) {
            setUnsavedChangesDialog({
                isOpen: true,
                action: 'clear',
            })
            return
        }

        // No unsaved changes, confirm and proceed
        if (
            window.confirm(
                'Are you sure you want to clear the canvas? This will remove all tasks, states, and links from the current view.'
            )
        ) {
            performClearCanvas()
        }
    }

    const performClearCanvas = () => {
        canvasRef.current?.clearCanvas()
        setCurrentCanvasId(null)
        setCurrentCanvasName('')
        clearCurrentCanvasId()
    }

    const resumePendingAction = () => {
        if (!pendingActionAfterSave) return

        if (pendingActionAfterSave.action === 'load') {
            const { canvasId } = pendingActionAfterSave
            if (canvasId) {
                performLoadCanvas(canvasId)
                setLoadModalOpen(false)
            }
        } else if (pendingActionAfterSave.action === 'clear') {
            if (
                window.confirm(
                    'Are you sure you want to clear the canvas? This will remove all tasks, states, and links from the current view.'
                )
            ) {
                performClearCanvas()
            }
        }

        setPendingActionAfterSave(null)
        setUnsavedChangesDialog({ isOpen: false, action: null })
    }

    const handleDeleteSavedCanvas = () => {
        const canvases = listCanvases()
        if (canvases.length === 0) {
            alert('No saved canvases to delete.')
            return
        }

        const canvasNames = canvases
            .map((c) => `${c.name} (${c.id})`)
            .join('\n')
        const response = window.prompt(
            `Enter the name of the canvas to delete:\n\nAvailable canvases:\n${canvasNames}`
        )

        if (!response) return

        const canvasToDelete = canvases.find((c) => c.name === response.trim())
        if (!canvasToDelete) {
            alert('Canvas not found.')
            return
        }

        if (
            window.confirm(
                `Are you sure you want to delete "${canvasToDelete.name}"? This action cannot be undone.`
            )
        ) {
            const success = deleteCanvas(canvasToDelete.id)
            if (success) {
                alert(`Canvas "${canvasToDelete.name}" deleted successfully!`)
                // Clear current canvas if it was deleted
                if (currentCanvasId === canvasToDelete.id) {
                    setCurrentCanvasId(null)
                    setCurrentCanvasName('')
                }
            } else {
                alert('Failed to delete canvas.')
            }
        }
    }

    const handleUnsavedChangesSave = () => {
        if (unsavedChangesDialog.action) {
            setPendingActionAfterSave({
                action: unsavedChangesDialog.action,
                canvasId: unsavedChangesDialog.pendingCanvasId,
            })
        } else {
            setPendingActionAfterSave(null)
        }

        // Trigger save modal
        setUnsavedChangesDialog((prev) => ({ ...prev, isOpen: false }))
        setSaveModalOpen(true)
    }

    const handleUnsavedChangesDiscard = () => {
        const { action, pendingCanvasId } = unsavedChangesDialog

        setUnsavedChangesDialog({ isOpen: false, action: null })
        setPendingActionAfterSave(null)

        if (action === 'load' && pendingCanvasId) {
            performLoadCanvas(pendingCanvasId)
            setLoadModalOpen(false)
        } else if (action === 'clear') {
            if (
                window.confirm(
                    'Are you sure you want to clear the canvas? This will remove all tasks, states, and links from the current view.'
                )
            ) {
                performClearCanvas()
            }
        }
    }

    const handleUnsavedChangesCancel = () => {
        setUnsavedChangesDialog({ isOpen: false, action: null })
        setPendingActionAfterSave(null)
    }

    const handleSaveCanvasCancel = () => {
        setSaveModalOpen(false)
        setPendingActionAfterSave(null)
    }

    // Handle beforeunload event to warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (canvasRef.current?.isDirty()) {
                e.preventDefault()
                e.returnValue = ''
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    return (
        <div className="App">
            <Taskbar
                onCreateTask={handleCreateTask}
                onSaveCanvas={handleSaveCanvas}
                onSaveAsCanvas={handleSaveAsCanvas}
                onLoadCanvas={handleLoadCanvas}
                onClearCanvas={handleClearCanvas}
                onDeleteSavedCanvas={handleDeleteSavedCanvas}
            />
            <main className="App-main">
                <InfiniteCanvas ref={canvasRef} />
            </main>
            <SaveCanvasModal
                isOpen={saveModalOpen}
                currentName={currentCanvasName}
                onSave={handleSaveCanvasConfirm}
                onCancel={handleSaveCanvasCancel}
            />
            <LoadCanvasModal
                isOpen={loadModalOpen}
                onLoad={handleLoadCanvasConfirm}
                onCancel={() => setLoadModalOpen(false)}
            />
            <UnsavedChangesDialog
                isOpen={unsavedChangesDialog.isOpen}
                onSave={handleUnsavedChangesSave}
                onDiscard={handleUnsavedChangesDiscard}
                onCancel={handleUnsavedChangesCancel}
            />
        </div>
    )
}

export default App
