import React, { useRef } from 'react'
import InfiniteCanvas, { InfiniteCanvasRef } from './components/InfiniteCanvas'
import Taskbar from './components/Taskbar'
import './App.css'

function App() {
    const canvasRef = useRef<InfiniteCanvasRef>(null)

    const handleCreateTask = () => {
        canvasRef.current?.createTask()
    }

    const handleSaveCanvas = () => {
        // TODO: Implement actual persistence to DB in future story
        console.log('Save Canvas - Not yet implemented')
        alert('Save Canvas functionality will be implemented in a future story.')
    }

    const handleLoadCanvas = () => {
        // TODO: Implement actual persistence from DB in future story
        console.log('Load Canvas - Not yet implemented')
        alert('Load Canvas functionality will be implemented in a future story.')
    }

    const handleClearCanvas = () => {
        if (
            window.confirm(
                'Are you sure you want to clear the canvas? This will remove all tasks, states, and links.'
            )
        ) {
            canvasRef.current?.clearCanvas()
        }
    }

    const handleDeleteSavedCanvas = () => {
        // TODO: Implement actual deletion from DB in future story
        console.log('Delete Saved Canvas - Not yet implemented')
        alert(
            'Delete Saved Canvas functionality will be implemented in a future story.'
        )
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
        </div>
    )
}

export default App
