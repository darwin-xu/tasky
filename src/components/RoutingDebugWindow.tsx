import React, { useEffect, useState } from 'react'
import {
    routingDebugService,
    RoutingDebugSession,
} from '../services/routingDebugService'
import './RoutingDebugWindow.css'

const RoutingDebugWindow: React.FC = () => {
    const [sessions, setSessions] = useState<RoutingDebugSession[]>([])
    const [selectedSessionIndex, setSelectedSessionIndex] = useState<
        number | null
    >(null)

    useEffect(() => {
        // Load sessions on mount
        const loadedSessions = routingDebugService.getSessions()
        setSessions(loadedSessions)
        if (loadedSessions.length > 0) {
            setSelectedSessionIndex(loadedSessions.length - 1)
        }

        // Auto-refresh every second to catch new sessions
        const interval = setInterval(() => {
            const updatedSessions = routingDebugService.getSessions()
            if (updatedSessions.length !== sessions.length) {
                setSessions(updatedSessions)
                setSelectedSessionIndex(updatedSessions.length - 1)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [sessions.length])

    const selectedSession =
        selectedSessionIndex !== null ? sessions[selectedSessionIndex] : null

    const formatPath = (points: number[]): string => {
        const coords = []
        for (let i = 0; i < points.length; i += 2) {
            coords.push(`(${points[i]}, ${points[i + 1]})`)
        }
        return coords.join(' → ')
    }

    const formatTimestamp = (timestamp: number): string => {
        return new Date(timestamp).toLocaleTimeString()
    }

    return (
        <div className="routing-debug-window">
            <header className="debug-header">
                <h1>🔍 Routing Algorithm Debug Viewer</h1>
                <button
                    onClick={() => {
                        routingDebugService.clearSessions()
                        setSessions([])
                        setSelectedSessionIndex(null)
                    }}
                    className="clear-button"
                >
                    Clear All Sessions
                </button>
            </header>

            <div className="debug-content">
                <aside className="sessions-sidebar">
                    <h2>
                        Sessions ({sessions.length})
                        {sessions.length === 0 && (
                            <span className="hint">
                                (Click links in the main canvas to generate
                                sessions)
                            </span>
                        )}
                    </h2>
                    <div className="sessions-list">
                        {sessions.map((session, index) => (
                            <div
                                key={index}
                                className={`session-item ${index === selectedSessionIndex ? 'selected' : ''}`}
                                onClick={() => setSelectedSessionIndex(index)}
                            >
                                <div className="session-title">
                                    Session {index + 1}
                                </div>
                                <div className="session-meta">
                                    {formatTimestamp(session.timestamp)}
                                </div>
                                <div className="session-ids">
                                    {session.sourceId.substring(0, 8)} →{' '}
                                    {session.targetId.substring(0, 8)}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                <main className="session-details">
                    {selectedSession ? (
                        <>
                            <section className="session-overview">
                                <h2>Session Overview</h2>
                                <div className="overview-grid">
                                    <div className="overview-item">
                                        <strong>Source ID:</strong>{' '}
                                        {selectedSession.sourceId}
                                    </div>
                                    <div className="overview-item">
                                        <strong>Target ID:</strong>{' '}
                                        {selectedSession.targetId}
                                    </div>
                                    <div className="overview-item">
                                        <strong>Start Point:</strong> (
                                        {selectedSession.startPoint.x},{' '}
                                        {selectedSession.startPoint.y})
                                    </div>
                                    <div className="overview-item">
                                        <strong>End Point:</strong> (
                                        {selectedSession.endPoint.x},{' '}
                                        {selectedSession.endPoint.y})
                                    </div>
                                    <div className="overview-item">
                                        <strong>Obstacles:</strong>{' '}
                                        {selectedSession.obstacles.length}
                                    </div>
                                    <div className="overview-item">
                                        <strong>Final Strategy:</strong>{' '}
                                        {selectedSession.finalStrategy}
                                    </div>
                                </div>
                            </section>

                            <section className="obstacles-section">
                                <h2>Obstacles</h2>
                                <div className="obstacles-list">
                                    {selectedSession.obstacles.map(
                                        (obstacle, idx) => (
                                            <div
                                                key={idx}
                                                className="obstacle-item"
                                            >
                                                Obstacle {idx + 1}: x=
                                                {obstacle.x}, y={obstacle.y}, w=
                                                {obstacle.width}, h=
                                                {obstacle.height}
                                            </div>
                                        )
                                    )}
                                    {selectedSession.obstacles.length === 0 && (
                                        <div className="no-obstacles">
                                            No obstacles detected
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="steps-section">
                                <h2>
                                    Algorithm Steps (
                                    {selectedSession.steps.length})
                                </h2>
                                <div className="steps-list">
                                    {selectedSession.steps.map((step) => (
                                        <div
                                            key={step.step}
                                            className={`step-item ${step.rejected ? 'rejected' : 'accepted'}`}
                                        >
                                            <div className="step-header">
                                                <span className="step-number">
                                                    Step {step.step}
                                                </span>
                                                <span
                                                    className={`step-status ${step.rejected ? 'status-rejected' : 'status-accepted'}`}
                                                >
                                                    {step.rejected
                                                        ? '❌ Rejected'
                                                        : '✅ Accepted'}
                                                </span>
                                            </div>
                                            <div className="step-description">
                                                <strong>Description:</strong>{' '}
                                                {step.description}
                                            </div>
                                            <div className="step-decision">
                                                <strong>Decision:</strong>{' '}
                                                {step.decision}
                                            </div>
                                            {step.reason && (
                                                <div className="step-reason">
                                                    <strong>Reason:</strong>{' '}
                                                    {step.reason}
                                                </div>
                                            )}
                                            {step.pathPoints && (
                                                <div className="step-path">
                                                    <strong>Path:</strong>{' '}
                                                    {formatPath(
                                                        step.pathPoints
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="final-path-section">
                                <h2>Final Selected Path</h2>
                                <div className="final-path">
                                    {formatPath(selectedSession.finalPath)}
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="no-selection">
                            <p>
                                Select a session from the sidebar to view
                                details
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default RoutingDebugWindow
