import React, { useRef } from 'react'
import InfiniteCanvas, { InfiniteCanvasRef } from './components/InfiniteCanvas'
import Taskbar from './components/Taskbar'
import './App.css'

function App() {
    const canvasRef = useRef<InfiniteCanvasRef>(null)

    const handleCreateTask = () => {
        canvasRef.current?.createTask()
    }

    return (
        <div className="App">
            <Taskbar onCreateTask={handleCreateTask} />
            <main className="App-main">
                <InfiniteCanvas ref={canvasRef} />
            </main>
        </div>
    )
}

export default App
