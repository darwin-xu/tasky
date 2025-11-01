import React, { useState, useEffect, useRef } from 'react'
import { isValidDate } from '../utils/dateValidation'
import {
    useModalEscapeHandler,
    useDateValidation,
    useModalBackdropHandler,
} from '../hooks/useModalHelpers'
import { DateField } from './DateField'
import { PriorityField } from './PriorityField'
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

    const { validateDate } = useDateValidation()
    const { handleModalMouseDown, handleBackdropClick } =
        useModalBackdropHandler()

    useModalEscapeHandler({ isOpen, onCancel })

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

    const handleDateChange = (value: string) => {
        setDate(value)
        validateDate(value, setDateError)
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

    if (!isOpen) return null

    return (
        <div
            className="state-editor-overlay"
            onMouseDown={handleModalMouseDown}
            onClick={(e) => handleBackdropClick(e, onCancel)}
            data-testid="state-editor-overlay"
        >
            <div
                className="state-editor-modal"
                data-testid="state-editor-modal"
            >
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

                    <DateField
                        id="state-date"
                        value={date}
                        onChange={handleDateChange}
                        error={dateError}
                        testId="state-date-input"
                        className="state-editor-field"
                    />

                    <PriorityField
                        id="state-priority"
                        value={priority}
                        onChange={setPriority}
                        testId="state-priority-select"
                        className="state-editor-field"
                    />

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
