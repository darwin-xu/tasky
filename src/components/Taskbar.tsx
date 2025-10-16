import React from 'react'
import './Taskbar.css'

interface TaskbarProps {
    onCreateTask: () => void
}

const Taskbar: React.FC<TaskbarProps> = ({ onCreateTask }) => {
    return (
        <div className="taskbar">
            <h1 className="taskbar-title">Tasky - Infinite Canvas</h1>
            <div className="taskbar-actions">
                <button
                    className="taskbar-button create-task-button"
                    onClick={onCreateTask}
                    aria-label="Create Task"
                >
                    + Create Task
                </button>
            </div>
        </div>
    )
}

export default Taskbar
