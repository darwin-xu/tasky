import React from 'react'
import './ConfirmDialog.css'

export interface UnsavedChangesDialogProps {
    isOpen: boolean
    onSave: () => void
    onDiscard: () => void
    onCancel: () => void
}

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
    isOpen,
    onSave,
    onDiscard,
    onCancel,
}) => {
    if (!isOpen) return null

    return (
        <div className="confirm-dialog-overlay" onClick={onCancel}>
            <div
                className="confirm-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="confirm-dialog-title">Unsaved Changes</h2>
                <p className="confirm-dialog-message">
                    You have unsaved changes. Do you want to save before
                    closing?
                </p>
                <div className="confirm-dialog-actions">
                    <button
                        className="confirm-dialog-button cancel"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="confirm-dialog-button"
                        onClick={onDiscard}
                    >
                        Discard
                    </button>
                    <button
                        className="confirm-dialog-button confirm"
                        onClick={onSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UnsavedChangesDialog
