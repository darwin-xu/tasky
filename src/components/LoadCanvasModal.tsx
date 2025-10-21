import React, { useState, useEffect } from 'react'
import { CanvasMetadata } from '../types'
import { listCanvases } from '../services/canvasService'
import './LoadCanvasModal.css'

export interface LoadCanvasModalProps {
    isOpen: boolean
    onLoad: (canvasId: string) => void
    onCancel: () => void
}

const LoadCanvasModal: React.FC<LoadCanvasModalProps> = ({
    isOpen,
    onLoad,
    onCancel,
}) => {
    const [canvases, setCanvases] = useState<CanvasMetadata[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            const savedCanvases = listCanvases()
            setCanvases(savedCanvases)
            setSelectedId(savedCanvases.length > 0 ? savedCanvases[0].id : null)
        }
    }, [isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedId) {
            onLoad(selectedId)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel()
        }
    }

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className="modal-content load-canvas-modal"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <h2>Load Canvas</h2>
                {canvases.length === 0 ? (
                    <div className="empty-state">
                        <p>No saved canvases found.</p>
                        <p>Create and save a canvas to see it here.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="canvas-list">
                            {canvases.map((canvas) => (
                                <div
                                    key={canvas.id}
                                    className={`canvas-item ${
                                        selectedId === canvas.id
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() => setSelectedId(canvas.id)}
                                >
                                    <div className="canvas-item-header">
                                        <input
                                            type="radio"
                                            name="canvas"
                                            value={canvas.id}
                                            checked={selectedId === canvas.id}
                                            onChange={() =>
                                                setSelectedId(canvas.id)
                                            }
                                        />
                                        <span className="canvas-name">
                                            {canvas.name}
                                        </span>
                                    </div>
                                    <div className="canvas-item-details">
                                        <span className="canvas-date">
                                            Last updated:{' '}
                                            {formatDate(canvas.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
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
                                className="load-button"
                                disabled={!selectedId}
                            >
                                Load
                            </button>
                        </div>
                    </form>
                )}
                {canvases.length === 0 && (
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onCancel}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LoadCanvasModal
