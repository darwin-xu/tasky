import React, { useState, useEffect, useRef } from 'react'
import { isValidDate } from '../utils/dateValidation'
import './TaskEditorModal.css'

export interface TaskEditorData {
    title: string
    description?: string
    date?: string
    priority: 'Low' | 'Medium' | 'High'
}

interface TaskEditorModalProps {
    isOpen: boolean
    taskData: TaskEditorData
    onSave: (data: TaskEditorData) => void
    onCancel: () => void
}

const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
    isOpen,
    taskData,
    onSave,
    onCancel,
}) => {
    const [title, setTitle] = useState(taskData.title)
    const [description, setDescription] = useState(taskData.description || '')
    const [date, setDate] = useState(taskData.date || '')
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>(
        taskData.priority
    )
    const [dateError, setDateError] = useState('')
    const titleInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setTitle(taskData.title)
            setDescription(taskData.description || '')
            setDate(taskData.date || '')
            setPriority(taskData.priority)
            setDateError('')
            // Focus title input when modal opens
            setTimeout(() => {
                titleInputRef.current?.focus()
            }, 0)
        }
    }, [isOpen, taskData])

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
        if (!title.trim()) {
            return // Don't save if title is empty
        }

        if (date && !isValidDate(date)) {
            return // Don't save if date is invalid
        }

        onSave({
            title: title.trim(),
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
            className="task-editor-overlay"
            onClick={handleBackdropClick}
            data-testid="task-editor-overlay"
        >
            <div className="task-editor-modal" data-testid="task-editor-modal">
                <h2 className="task-editor-title">Edit Task</h2>
                <form onSubmit={handleSubmit}>
                    <div className="task-editor-field">
                        <label htmlFor="task-title">
                            Title <span className="required">*</span>
                        </label>
                        <input
                            ref={titleInputRef}
                            id="task-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title"
                            required
                            data-testid="task-title-input"
                        />
                    </div>

                    <div className="task-editor-field">
                        <label htmlFor="task-description">Description</label>
                        <textarea
                            id="task-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter task description"
                            rows={4}
                            data-testid="task-description-input"
                        />
                    </div>

                    <div className="task-editor-field">
                        <label htmlFor="task-date">Date</label>
                        <input
                            id="task-date"
                            type="text"
                            value={date}
                            onChange={(e) => handleDateChange(e.target.value)}
                            placeholder="YYYY-MM-DD"
                            data-testid="task-date-input"
                        />
                        {dateError && (
                            <div
                                className="task-editor-error"
                                data-testid="date-error"
                            >
                                {dateError}
                            </div>
                        )}
                    </div>

                    <div className="task-editor-field">
                        <label htmlFor="task-priority">Priority</label>
                        <select
                            id="task-priority"
                            value={priority}
                            onChange={(e) =>
                                setPriority(
                                    e.target.value as 'Low' | 'Medium' | 'High'
                                )
                            }
                            data-testid="task-priority-select"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div className="task-editor-actions">
                        <button
                            type="button"
                            className="task-editor-button task-editor-button-cancel"
                            onClick={onCancel}
                            data-testid="cancel-button"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="task-editor-button task-editor-button-save"
                            disabled={!title.trim() || !!dateError}
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

export default TaskEditorModal
