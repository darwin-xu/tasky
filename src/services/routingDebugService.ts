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

class RoutingDebugService {
    private sessions: RoutingDebugSession[] = []
    private currentSession: RoutingDebugSession | null = null
    private enabled: boolean = false

    enable() {
        this.enabled = true
    }

    disable() {
        this.enabled = false
    }

    isEnabled(): boolean {
        return this.enabled
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
        if (!this.enabled) return

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
        if (!this.enabled || !this.currentSession) return

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
        if (!this.enabled || !this.currentSession) return

        this.currentSession.finalPath = finalPath
        this.currentSession.finalStrategy = finalStrategy
        this.sessions.push(this.currentSession)
        this.currentSession = null

        // Keep only last 50 sessions
        if (this.sessions.length > 50) {
            this.sessions = this.sessions.slice(-50)
        }
    }

    getSessions(): RoutingDebugSession[] {
        return this.sessions
    }

    getLatestSession(): RoutingDebugSession | null {
        return this.sessions[this.sessions.length - 1] || null
    }

    clearSessions() {
        this.sessions = []
        this.currentSession = null
    }
}

export const routingDebugService = new RoutingDebugService()
