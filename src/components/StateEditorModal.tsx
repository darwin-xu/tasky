import React, { useState, useEffect, useRef } from 'react'
import { isValidDate } from '../utils/dateValidation'
import './StateEditorModal.css'

export interface StateEditorData {
    description: string
    date?: string
    priority: 'Low' | 'Medium' | 'High'
}

interface StateEditorModalProps {
    isOpen: boolean
    stateData: StateEditorData
    onSave: (data: StateEditorData) => void
    onCancel: () => void
}

const StateEditorModal: React.FC<StateEditorModalProps> = ({
    isOpen,
    stateData,
    onSave,
    onCancel,
}) => {
    const [description, setDescription] = useState(stateData.description)
    const [date, setDate] = useState(stateData.date || '')
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>(
        stateData.priority
    )
    const [dateError, setDateError] = useState('')
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isOpen) {
            setDescription(stateData.description)
            setDate(stateData.date || '')
            setPriority(stateData.priority)
            setDateError('')
            // Focus description input when modal opens
            setTimeout(() => {
                descriptionInputRef.current?.focus()
            }, 0)
        }
    }, [isOpen, stateData])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onCancel])

    const handleDateChange = (value: string) => {
        setDate(value)
        if (value && !isValidDate(value)) {
            setDateError('Invalid date format. Use YYYY-MM-DD (e.g., 2024-12-31)')
        } else {
            setDateError('')
        }
    }

    const handleSave = () => {
        // Validate before saving
        if (!description.trim()) {
            return // Don't save if description is empty
        }

        if (date && !isValidDate(date)) {
            return // Don't save if date is invalid
        }

        onSave({
            description: description.trim(),
            date,
            priority,
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSave()
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onCancel()
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="state-editor-overlay"
            onClick={handleBackdropClick}
            data-testid="state-editor-overlay"
        >
            <div className="state-editor-modal" data-testid="state-editor-modal">
                <h2 className="state-editor-title">Edit State</h2>
                <form onSubmit={handleSubmit}>
                    <div className="state-editor-field">
                        <label htmlFor="state-description">
                            Description <span className="required">*</span>
                        </label>
                        <textarea
                            ref={descriptionInputRef}
                            id="state-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter state description"
                            rows={4}
                            required
                            data-testid="state-description-input"
                        />
                    </div>

                    <div className="state-editor-field">
                        <label htmlFor="state-date">Date</label>
                        <input
                            id="state-date"
                            type="text"
                            value={date}
                            onChange={(e) => handleDateChange(e.target.value)}
                            placeholder="YYYY-MM-DD"
                            data-testid="state-date-input"
                        />
                        {dateError && (
                            <div
                                className="state-editor-error"
                                data-testid="date-error"
                            >
                                {dateError}
                            </div>
                        )}
                    </div>

                    <div className="state-editor-field">
                        <label htmlFor="state-priority">Priority</label>
                        <select
                            id="state-priority"
                            value={priority}
                            onChange={(e) =>
                                setPriority(
                                    e.target.value as 'Low' | 'Medium' | 'High'
                                )
                            }
                            data-testid="state-priority-select"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div className="state-editor-actions">
                        <button
                            type="button"
                            className="state-editor-button state-editor-button-cancel"
                            onClick={onCancel}
                            data-testid="cancel-button"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="state-editor-button state-editor-button-save"
                            disabled={!description.trim() || !!dateError}
                            data-testid="save-button"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default StateEditorModal
