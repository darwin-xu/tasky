import React from 'react'
import { Priority } from '../utils/priorityHelpers'

interface PriorityFieldProps {
    id: string
    value: Priority
    onChange: (value: Priority) => void
    label?: string
    testId?: string
    className?: string
}

export const PriorityField: React.FC<PriorityFieldProps> = ({
    id,
    value,
    onChange,
    label = 'Priority',
    testId = 'priority-select',
    className = 'task-editor-field',
}) => {
    return (
        <div className={className}>
            <label htmlFor={id}>{label}</label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value as Priority)}
                data-testid={testId}
            >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
        </div>
    )
}
