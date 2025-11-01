import React from 'react'

interface DateFieldProps {
    id: string
    value: string
    onChange: (value: string) => void
    error?: string
    label?: string
    testId?: string
    className?: string
}

export const DateField: React.FC<DateFieldProps> = ({
    id,
    value,
    onChange,
    error,
    label = 'Date',
    testId = 'date-input',
    className = 'task-editor-field',
}) => {
    return (
        <div className={className}>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="YYYY-MM-DD"
                data-testid={testId}
            />
            {error && (
                <div className="task-editor-error" data-testid="date-error">
                    {error}
                </div>
            )}
        </div>
    )
}
