import React, { useState, useRef, useEffect } from 'react'
import './Taskbar.css'

interface TaskbarProps {
    onCreateTask: () => void
    onSaveCanvas?: () => void
    onSaveAsCanvas?: () => void
    onLoadCanvas?: () => void
    onClearCanvas?: () => void
    onDeleteSavedCanvas?: () => void
    debugMode?: boolean
    onDebugModeToggle?: (enabled: boolean) => void
}

const Taskbar: React.FC<TaskbarProps> = ({
    onCreateTask,
    onSaveCanvas,
    onSaveAsCanvas,
    onLoadCanvas,
    onClearCanvas,
    onDeleteSavedCanvas,
    debugMode = false,
    onDebugModeToggle,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false)
            }
        }

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isMenuOpen])

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const handleMenuAction = (action: () => void | undefined) => {
        if (action) {
            action()
        }
        setIsMenuOpen(false)
    }

    return (
        <div className="taskbar">
            <h1 className="taskbar-title">Tasky - Infinite Canvas</h1>
            <div className="taskbar-actions">
                <div className="taskbar-menu" ref={menuRef}>
                    <button
                        className="taskbar-button menu-button"
                        onClick={toggleMenu}
                        aria-label="Data Menu"
                        aria-expanded={isMenuOpen}
                    >
                        💾 Data
                    </button>
                    {isMenuOpen && (
                        <div className="taskbar-dropdown" role="menu">
                            <button
                                className="taskbar-dropdown-item"
                                onClick={() =>
                                    handleMenuAction(onSaveCanvas || (() => {}))
                                }
                                role="menuitem"
                                aria-label="Save Canvas"
                            >
                                Save Canvas
                            </button>
                            <button
                                className="taskbar-dropdown-item"
                                onClick={() =>
                                    handleMenuAction(
                                        onSaveAsCanvas || (() => {})
                                    )
                                }
                                role="menuitem"
                                aria-label="Save As Canvas"
                            >
                                Save As...
                            </button>
                            <button
                                className="taskbar-dropdown-item"
                                onClick={() =>
                                    handleMenuAction(onLoadCanvas || (() => {}))
                                }
                                role="menuitem"
                                aria-label="Load Canvas"
                            >
                                Load Canvas
                            </button>
                            <button
                                className="taskbar-dropdown-item"
                                onClick={() =>
                                    handleMenuAction(
                                        onClearCanvas || (() => {})
                                    )
                                }
                                role="menuitem"
                                aria-label="Clear Canvas"
                            >
                                Clear Canvas
                            </button>
                            <button
                                className="taskbar-dropdown-item"
                                onClick={() =>
                                    handleMenuAction(
                                        onDeleteSavedCanvas || (() => {})
                                    )
                                }
                                role="menuitem"
                                aria-label="Delete Saved Canvas"
                            >
                                Delete Saved Canvas
                            </button>
                        </div>
                    )}
                </div>
                {onDebugModeToggle && (
                    <label className="taskbar-debug-toggle">
                        <input
                            type="checkbox"
                            checked={debugMode}
                            onChange={(e) =>
                                onDebugModeToggle(e.target.checked)
                            }
                            aria-label="Debug Mode"
                        />
                        <span>Debug Routing</span>
                    </label>
                )}
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
