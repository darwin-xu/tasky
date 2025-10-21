import React, { useState, useEffect } from 'react'
import './SaveCanvasModal.css'

export interface SaveCanvasModalProps {
    isOpen: boolean
    currentName?: string
    onSave: (name: string) => void
    onCancel: () => void
}

const SaveCanvasModal: React.FC<SaveCanvasModalProps> = ({
    isOpen,
    currentName = '',
    onSave,
    onCancel,
}) => {
    const [name, setName] = useState(currentName)

    useEffect(() => {
        setName(currentName)
    }, [currentName, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onSave(name.trim())
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel()
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className="modal-content save-canvas-modal"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <h2>Save Canvas</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="canvas-name">Canvas Name</label>
                        <input
                            id="canvas-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter canvas name..."
                            autoFocus
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-button"
                            disabled={!name.trim()}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SaveCanvasModal
