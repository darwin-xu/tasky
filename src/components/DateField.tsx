import React from 'react'

interface DateFieldProps {
    id: string
    value: string
    onChange: (value: string) => void
    error?: string
    label?: string
    testId?: string
}

export const DateField: React.FC<DateFieldProps> = ({
    id,
    value,
    onChange,
    error,
    label = 'Date',
    testId = 'date-input',
}) => {
    return (
        <div className="task-editor-field">
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
