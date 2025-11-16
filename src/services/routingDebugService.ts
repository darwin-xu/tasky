// Service to collect and store routing algorithm debug information
export interface RoutingStep {
    step: number
    description: string
    decision: string
    pathPoints?: number[]
    rejected?: boolean
    reason?: string
}

export interface RoutingDebugSession {
    sourceId: string
    targetId: string
    timestamp: number
    startPoint: { x: number; y: number }
    endPoint: { x: number; y: number }
    obstacles: Array<{ x: number; y: number; width: number; height: number }>
    steps: RoutingStep[]
    finalPath: number[]
    finalStrategy: string
}

const STORAGE_KEY = 'routing-debug-sessions'
const ENABLED_KEY = 'routing-debug-enabled'

class RoutingDebugService {
    private currentSession: RoutingDebugSession | null = null

    enable() {
        localStorage.setItem(ENABLED_KEY, 'true')
    }

    disable() {
        localStorage.setItem(ENABLED_KEY, 'false')
    }

    isEnabled(): boolean {
        return localStorage.getItem(ENABLED_KEY) === 'true'
    }

    private loadSessions(): RoutingDebugSession[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            return data ? JSON.parse(data) : []
        } catch (e) {
            console.error('Failed to load debug sessions:', e)
            return []
        }
    }

    private saveSessions(sessions: RoutingDebugSession[]) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
        } catch (e) {
            console.error('Failed to save debug sessions:', e)
        }
    }

    startSession(
        sourceId: string,
        targetId: string,
        startPoint: { x: number; y: number },
        endPoint: { x: number; y: number },
        obstacles: Array<{
            x: number
            y: number
            width: number
            height: number
        }>
    ) {
        if (!this.isEnabled()) return

        this.currentSession = {
            sourceId,
            targetId,
            timestamp: Date.now(),
            startPoint,
            endPoint,
            obstacles: [...obstacles],
            steps: [],
            finalPath: [],
            finalStrategy: '',
        }
    }

    addStep(
        description: string,
        decision: string,
        pathPoints?: number[],
        rejected?: boolean,
        reason?: string
    ) {
        if (!this.isEnabled() || !this.currentSession) return

        this.currentSession.steps.push({
            step: this.currentSession.steps.length + 1,
            description,
            decision,
            pathPoints,
            rejected,
            reason,
        })
    }

    endSession(finalPath: number[], finalStrategy: string) {
        if (!this.isEnabled() || !this.currentSession) return

        this.currentSession.finalPath = finalPath
        this.currentSession.finalStrategy = finalStrategy

        const sessions = this.loadSessions()
        sessions.push(this.currentSession)

        // Keep only last 50 sessions
        const trimmedSessions =
            sessions.length > 50 ? sessions.slice(-50) : sessions
        this.saveSessions(trimmedSessions)

        this.currentSession = null
    }

    getSessions(): RoutingDebugSession[] {
        return this.loadSessions()
    }

    getLatestSession(): RoutingDebugSession | null {
        const sessions = this.loadSessions()
        return sessions[sessions.length - 1] || null
    }

    clearSessions() {
        this.saveSessions([])
        this.currentSession = null
    }
}

export const routingDebugService = new RoutingDebugService()
