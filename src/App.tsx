import React, { useRef, useState, useEffect } from 'react'
import InfiniteCanvas, { InfiniteCanvasRef } from './components/InfiniteCanvas'
import Taskbar from './components/Taskbar'
import SaveCanvasModal from './components/SaveCanvasModal'
import LoadCanvasModal from './components/LoadCanvasModal'
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
        setSaveModalOpen(true)
    }

    const handleSaveCanvasConfirm = (name: string) => {
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
                currentCanvasId || undefined
            )

            if (savedCanvas) {
                setCurrentCanvasId(savedCanvas.id)
                setCurrentCanvasName(savedCanvas.name)
                alert(`Canvas "${name}" saved successfully!`)
            } else {
                alert('Failed to save canvas.')
            }
        } catch (error) {
            console.error('Error saving canvas:', error)
            alert('An error occurred while saving the canvas.')
        } finally {
            setSaveModalOpen(false)
        }
    }

    const handleLoadCanvas = () => {
        setLoadModalOpen(true)
    }

    const handleLoadCanvasConfirm = (canvasId: string) => {
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
        setLoadModalOpen(false)
    }

    const handleClearCanvas = () => {
        if (
            window.confirm(
                'Are you sure you want to clear the canvas? This will remove all tasks, states, and links from the current view.'
            )
        ) {
            canvasRef.current?.clearCanvas()
            setCurrentCanvasId(null)
            setCurrentCanvasName('')
            clearCurrentCanvasId()
        }
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

    return (
        <div className="App">
            <Taskbar
                onCreateTask={handleCreateTask}
                onSaveCanvas={handleSaveCanvas}
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
                onCancel={() => setSaveModalOpen(false)}
            />
            <LoadCanvasModal
                isOpen={loadModalOpen}
                onLoad={handleLoadCanvasConfirm}
                onCancel={() => setLoadModalOpen(false)}
            />
        </div>
    )
}

export default App
