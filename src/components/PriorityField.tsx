import React from 'react'

type Priority = 'Low' | 'Medium' | 'High'

interface PriorityFieldProps {
    id: string
    value: Priority
    onChange: (value: Priority) => void
    label?: string
    testId?: string
}

export const PriorityField: React.FC<PriorityFieldProps> = ({
    id,
    value,
    onChange,
    label = 'Priority',
    testId = 'priority-select',
}) => {
    return (
        <div className="task-editor-field">
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
