import React, { useMemo } from 'react'
import { Arrow, Group, Rect, Text, Line } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { LINK, COLORS, TEXT, SNAP_PREVIEW } from '../constants'

export interface LinkProps {
    id: string
    sourceX: number
    sourceY: number
    sourceWidth: number
    sourceHeight: number
    targetX: number
    targetY: number
    targetWidth: number
    targetHeight: number
    linkStyle?: 'free' | 'orthogonal'
    routeAround?: boolean
    isSelected?: boolean
    onClick?: (id: string) => void
    onUpdateLinkStyle?: (id: string, style: 'free' | 'orthogonal') => void
    onUpdateRouteAround?: (id: string, routeAround: boolean) => void
    allCards?: Array<{ x: number; y: number; width: number; height: number }>
}

type RectLike = { x: number; y: number; width: number; height: number }

type Side = 'left' | 'right' | 'top' | 'bottom'

const rectsOverlap = (a: RectLike, b: RectLike): boolean => {
    return !(
        a.x + a.width <= b.x ||
        b.x + b.width <= a.x ||
        a.y + a.height <= b.y ||
        b.y + b.height <= a.y
    )
}

const getSideMidpoint = (
    rect: RectLike,
    side: Side
): { x: number; y: number } => {
    switch (side) {
        case 'left':
            return { x: rect.x, y: rect.y + rect.height / 2 }
        case 'right':
            return { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
        case 'top':
            return { x: rect.x + rect.width / 2, y: rect.y }
        case 'bottom':
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height }
        default:
            return { x: rect.x, y: rect.y }
    }
}

const squaredDistance = (
    a: { x: number; y: number },
    b: { x: number; y: number }
): number => {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return dx * dx + dy * dy
}

// Calculate the best anchor point on the edge of a rectangle
const calculateAnchorPoint = (
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number,
    targetX: number,
    targetY: number
): { x: number; y: number } => {
    // Calculate center points
    const sourceCenterX = sourceX + sourceWidth / 2
    const sourceCenterY = sourceY + sourceHeight / 2
    const targetCenterX = targetX
    const targetCenterY = targetY

    // Calculate angle from source to target
    const angle = Math.atan2(
        targetCenterY - sourceCenterY,
        targetCenterX - sourceCenterX
    )

    // Calculate intersection point on the edge of the source rectangle
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    let anchorX: number
    let anchorY: number

    // Determine which edge the line intersects
    const halfWidth = sourceWidth / 2
    const halfHeight = sourceHeight / 2

    if (Math.abs(cos) > Math.abs(sin * (sourceWidth / sourceHeight))) {
        // Intersects left or right edge
        if (cos > 0) {
            // Right edge
            anchorX = sourceX + sourceWidth
            anchorY = sourceCenterY + (halfWidth * sin) / cos
        } else {
            // Left edge
            anchorX = sourceX
            anchorY = sourceCenterY - (halfWidth * sin) / cos
        }
    } else {
        // Intersects top or bottom edge
        if (sin > 0) {
            // Bottom edge
            anchorX = sourceCenterX + (halfHeight * cos) / sin
            anchorY = sourceY + sourceHeight
        } else {
            // Top edge
            anchorX = sourceCenterX - (halfHeight * cos) / sin
            anchorY = sourceY
        }
    }

    return { x: anchorX, y: anchorY }
}

// Types for the routing algorithm
type Point = { x: number; y: number }
type RoutingRect = { x: number; y: number; width: number; height: number }

/**
 * Routes an orthogonal path from the right edge of rectangle A to the left edge of rectangle B.
 * The path consists of horizontal and vertical segments, avoiding overlap with the rectangles.
 *
 * @param {RoutingRect} A - The source rectangle (with x, y, width, height).
 * @param {RoutingRect} B - The target rectangle (with x, y, width, height).
 * @returns {Point[]} Array of points representing the orthogonal path from A to B.
 *
 * The algorithm:
 * - Starts at the center of the right edge of A.
 * - Ends at the center of the left edge of B.
 * - Calculates intermediate waypoints to ensure the path is orthogonal and does not intersect A or B.
 */
function routeRightToLeft(A: RoutingRect, B: RoutingRect): Point[] {
    // ---- 1. Ports ----
    const S: Point = {
        x: A.x + A.width,
        y: A.y + A.height / 2,
    }

    const E: Point = {
        x: B.x,
        y: B.y + B.height / 2,
    }

    // Helpful ranges
    const Aleft = A.x
    const Aright = A.x + A.width
    const Atop = A.y
    const Abottom = A.y + A.height

    const Bleft = B.x
    const Bright = B.x + B.width
    const Btop = B.y
    const Bbottom = B.y + B.height

    // -------------------------------------------------------
    // CASE 0 — Simple straight horizontal line (ideal case)
    // -------------------------------------------------------

    const yAligned = Math.abs(S.y - E.y) < LINK.Y_ALIGNMENT_EPSILON

    if (yAligned) {
        const y = S.y
        const x1 = Math.min(S.x, E.x)
        const x2 = Math.max(S.x, E.x)
        // Treat touching the boundary (>= right or <= left) as non-intersection
        const hitsA = y > Atop && y < Abottom && !(x2 <= Aleft || x1 >= Aright)
        const hitsB = y > Btop && y < Bbottom && !(x2 <= Bleft || x1 >= Bright)
        if (!hitsA && !hitsB) return [S, E]
    }

    // -------------------------------------------------------
    // SIMPLE MID CORRIDOR (A fully left of B, vertical offset)
    // -------------------------------------------------------
    if (Aright < Bleft) {
        const midX = (S.x + E.x) / 2
        return [S, { x: midX, y: S.y }, { x: midX, y: E.y }, E]
    }

    // -------------------------------------------------------
    // CASE 1 — Leave A horizontally (required)
    // -------------------------------------------------------
    const outX = S.x + LINK.ROUTING_OFFSET
    const first = { x: outX, y: S.y }

    // -------------------------------------------------------
    // CASE 2 — Try to find a vertical corridor between A and B
    // -------------------------------------------------------

    // A above B (check if there's enough vertical gap)
    if (Abottom + LINK.VERTICAL_GAP_THRESHOLD < Btop) {
        const mid = (Abottom + Btop) / 2
        const leftOfB = Bleft - LINK.ROUTING_OFFSET

        return [
            S,
            first,
            { x: outX, y: mid },
            { x: leftOfB, y: mid },
            { x: leftOfB, y: E.y },
            E,
        ]
    }

    // B above A (check if there's enough vertical gap)
    if (Bbottom + LINK.VERTICAL_GAP_THRESHOLD < Atop) {
        const mid = (Bbottom + Atop) / 2
        const leftOfB = Bleft - LINK.ROUTING_OFFSET

        return [
            S,
            first,
            { x: outX, y: mid },
            { x: leftOfB, y: mid },
            { x: leftOfB, y: E.y },
            E,
        ]
    }

    // -------------------------------------------------------
    // SPECIAL — Start point lies inside B, escape quickly
    // -------------------------------------------------------
    const startInsideB =
        S.x > Bleft && S.x < Bright && S.y > Btop && S.y < Bbottom
    if (startInsideB) {
        const bottomMaxLocal = Math.max(Abottom, Bbottom)
        const detourYLocal = bottomMaxLocal + LINK.ROUTING_OFFSET
        const leftOfBLocal = Bleft - LINK.ROUTING_OFFSET
        return [
            S,
            first,
            { x: outX, y: detourYLocal },
            { x: leftOfBLocal, y: detourYLocal },
            { x: leftOfBLocal, y: E.y },
            E,
        ]
    }

    // -------------------------------------------------------
    // CASE 3 — No corridor; choose safe outer detour
    // -------------------------------------------------------

    const rightMax = Math.max(Aright, Bright)
    const detourX = rightMax + LINK.ROUTING_OFFSET

    const bottomMax = Math.max(Abottom, Bbottom)
    const detourY = bottomMax + LINK.ROUTING_OFFSET
    const leftOfB = Bleft - LINK.ROUTING_OFFSET

    // Prefer a tighter detour: go down at outX if that vertical segment stays outside B
    // Check both vertical (S.y outside B's vertical range) and horizontal (outX outside B's horizontal range)
    const canTightDetour =
        (S.y > Bbottom || S.y < Btop) && (outX < Bleft || outX > Bright)
    if (canTightDetour) {
        return [
            S,
            first,
            { x: outX, y: detourY },
            { x: leftOfB, y: detourY },
            { x: leftOfB, y: E.y },
            E,
        ]
    }

    // Fallback: wide outer detour
    return [
        S,
        first,
        { x: detourX, y: S.y },
        { x: detourX, y: detourY },
        { x: leftOfB, y: detourY },
        { x: leftOfB, y: E.y },
        E,
    ]
}

// Convert Point[] to number[] for Konva
function pointsToFlatArray(points: Point[]): number[] {
    return points.flatMap((p) => [p.x, p.y])
}

// Calculate orthogonal path points using the routeRightToLeft algorithm
// Note: _routeAround and _allCards parameters are kept for API compatibility with existing callers
const calculateOrthogonalPath = (
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number,
    targetX: number,
    targetY: number,
    targetWidth: number,
    targetHeight: number,
    _routeAround: boolean,
    _allCards?: Array<{ x: number; y: number; width: number; height: number }>
): number[] => {
    const A: RoutingRect = {
        x: sourceX,
        y: sourceY,
        width: sourceWidth,
        height: sourceHeight,
    }

    const B: RoutingRect = {
        x: targetX,
        y: targetY,
        width: targetWidth,
        height: targetHeight,
    }

    const points = routeRightToLeft(A, B)
    return pointsToFlatArray(points)
}

const Link: React.FC<LinkProps> = ({
    id,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    targetX,
    targetY,
    targetWidth,
    targetHeight,
    linkStyle = 'free',
    routeAround = false,
    isSelected = false,
    onClick,
    onUpdateLinkStyle,
    onUpdateRouteAround,
    allCards = [],
}) => {
    // Memoize path calculation to avoid expensive computations on every render
    const { pathPoints, arrowPoints } = useMemo(() => {
        let pathPoints: number[]
        let arrowPoints: number[]

        if (linkStyle === 'orthogonal') {
            // Calculate orthogonal path
            pathPoints = calculateOrthogonalPath(
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                targetX,
                targetY,
                targetWidth,
                targetHeight,
                routeAround,
                allCards
            )

            // For arrow, use the last two segments
            const len = pathPoints.length
            arrowPoints = [
                pathPoints[len - 4],
                pathPoints[len - 3],
                pathPoints[len - 2],
                pathPoints[len - 1],
            ]
        } else {
            // Free style: draw direct path without considering obstacles
            const sourceRect: RectLike = {
                x: sourceX,
                y: sourceY,
                width: sourceWidth,
                height: sourceHeight,
            }
            const targetRect: RectLike = {
                x: targetX,
                y: targetY,
                width: targetWidth,
                height: targetHeight,
            }

            if (rectsOverlap(sourceRect, targetRect)) {
                return { pathPoints: [], arrowPoints: [] }
            }

            const connectionPairs: Array<{
                sourceSide: Side
                targetSide: Side
            }> = [
                { sourceSide: 'left', targetSide: 'right' },
                { sourceSide: 'right', targetSide: 'left' },
                { sourceSide: 'top', targetSide: 'bottom' },
                { sourceSide: 'bottom', targetSide: 'top' },
            ]

            // Calculate all possible connection points without obstacle checking
            const candidates = connectionPairs.map((pair) => {
                const start = getSideMidpoint(sourceRect, pair.sourceSide)
                const end = getSideMidpoint(targetRect, pair.targetSide)
                return {
                    start,
                    end,
                    distance: squaredDistance(start, end),
                }
            })

            // Select the shortest path without considering obstacles
            const preferred = candidates.reduce((min, curr) =>
                curr.distance < min.distance ? curr : min
            )

            if (!preferred) {
                const fallbackSource = calculateAnchorPoint(
                    sourceX,
                    sourceY,
                    sourceWidth,
                    sourceHeight,
                    targetX + targetWidth / 2,
                    targetY + targetHeight / 2
                )
                const fallbackTarget = calculateAnchorPoint(
                    targetX,
                    targetY,
                    targetWidth,
                    targetHeight,
                    sourceX + sourceWidth / 2,
                    sourceY + sourceHeight / 2
                )
                arrowPoints = [
                    fallbackSource.x,
                    fallbackSource.y,
                    fallbackTarget.x,
                    fallbackTarget.y,
                ]
                pathPoints = arrowPoints
            } else {
                arrowPoints = [
                    preferred.start.x,
                    preferred.start.y,
                    preferred.end.x,
                    preferred.end.y,
                ]
                pathPoints = arrowPoints
            }
        }

        return { pathPoints, arrowPoints }
    }, [
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        targetX,
        targetY,
        targetWidth,
        targetHeight,
        linkStyle,
        routeAround,
        allCards,
    ])

    // Early return if overlapping rectangles in free mode
    if (pathPoints.length === 0 && arrowPoints.length === 0) {
        return null
    }

    // Calculate midpoint for control buttons
    const midX = (pathPoints[0] + pathPoints[pathPoints.length - 2]) / 2
    const midY = (pathPoints[1] + pathPoints[pathPoints.length - 1]) / 2

    const handleClick = () => {
        if (onClick) {
            onClick(id)
        }
    }

    const handleStyleToggle = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onUpdateLinkStyle) {
            const newStyle = linkStyle === 'free' ? 'orthogonal' : 'free'
            onUpdateLinkStyle(id, newStyle)
        }
    }

    const handleRouteAroundToggle = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onUpdateRouteAround) {
            onUpdateRouteAround(id, !routeAround)
        }
    }

    return (
        <>
            {linkStyle === 'orthogonal' ? (
                <>
                    <Line
                        points={pathPoints}
                        stroke={
                            isSelected
                                ? COLORS.LINK_SELECTED
                                : COLORS.LINK_NORMAL
                        }
                        strokeWidth={
                            isSelected
                                ? LINK.STROKE_WIDTH_SELECTED
                                : LINK.STROKE_WIDTH_NORMAL
                        }
                        onClick={handleClick}
                        onTap={handleClick}
                        hitStrokeWidth={LINK.HIT_STROKE_WIDTH}
                    />
                    <Arrow
                        points={arrowPoints}
                        stroke={
                            isSelected
                                ? COLORS.LINK_SELECTED
                                : COLORS.LINK_NORMAL
                        }
                        strokeWidth={
                            isSelected
                                ? LINK.STROKE_WIDTH_SELECTED
                                : LINK.STROKE_WIDTH_NORMAL
                        }
                        fill={
                            isSelected
                                ? COLORS.LINK_SELECTED
                                : COLORS.LINK_NORMAL
                        }
                        pointerLength={LINK.POINTER_LENGTH}
                        pointerWidth={LINK.POINTER_WIDTH}
                        onClick={handleClick}
                        onTap={handleClick}
                        hitStrokeWidth={LINK.HIT_STROKE_WIDTH}
                    />
                </>
            ) : (
                <Arrow
                    points={arrowPoints}
                    stroke={
                        isSelected ? COLORS.LINK_SELECTED : COLORS.LINK_NORMAL
                    }
                    strokeWidth={
                        isSelected
                            ? LINK.STROKE_WIDTH_SELECTED
                            : LINK.STROKE_WIDTH_NORMAL
                    }
                    fill={
                        isSelected ? COLORS.LINK_SELECTED : COLORS.LINK_NORMAL
                    }
                    pointerLength={LINK.POINTER_LENGTH}
                    pointerWidth={LINK.POINTER_WIDTH}
                    onClick={handleClick}
                    onTap={handleClick}
                    hitStrokeWidth={LINK.HIT_STROKE_WIDTH}
                />
            )}

            {/* Control buttons - only visible when selected */}
            {isSelected && (
                <Group x={midX} y={midY}>
                    {/* Link style toggle button */}
                    {onUpdateLinkStyle && (
                        <>
                            <Rect
                                x={LINK.STYLE_TOGGLE_X_OFFSET}
                                y={LINK.STYLE_TOGGLE_Y_OFFSET}
                                width={LINK.CONTROL_BUTTON_WIDTH}
                                height={LINK.CONTROL_BUTTON_HEIGHT}
                                fill={COLORS.LINK_STYLE_BUTTON}
                                cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                                onClick={handleStyleToggle}
                                onTap={handleStyleToggle}
                            />
                            <Text
                                text={
                                    linkStyle === 'free'
                                        ? 'Free ⇄ Ortho'
                                        : 'Ortho ⇄ Free'
                                }
                                x={LINK.STYLE_TOGGLE_X_OFFSET}
                                y={LINK.STYLE_TOGGLE_Y_OFFSET}
                                width={LINK.CONTROL_BUTTON_WIDTH}
                                height={LINK.CONTROL_BUTTON_HEIGHT}
                                fontSize={LINK.STYLE_TOGGLE_FONT_SIZE}
                                fontFamily={TEXT.FONT_FAMILY}
                                fill={COLORS.TEXT_WHITE}
                                align={TEXT.ALIGN_CENTER}
                                verticalAlign={TEXT.VERTICAL_ALIGN_MIDDLE}
                                onClick={handleStyleToggle}
                                onTap={handleStyleToggle}
                            />
                        </>
                    )}

                    {/* Route around toggle button - only visible when orthogonal */}
                    {linkStyle === 'orthogonal' && onUpdateRouteAround && (
                        <>
                            <Rect
                                x={LINK.ROUTE_AROUND_X_OFFSET}
                                y={LINK.ROUTE_AROUND_Y_OFFSET}
                                width={LINK.CONTROL_BUTTON_WIDTH}
                                height={LINK.CONTROL_BUTTON_HEIGHT}
                                fill={
                                    routeAround
                                        ? COLORS.LINK_ROUTE_AROUND_ACTIVE
                                        : COLORS.LINK_ROUTE_AROUND_INACTIVE
                                }
                                cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                                onClick={handleRouteAroundToggle}
                                onTap={handleRouteAroundToggle}
                            />
                            <Text
                                text={
                                    routeAround
                                        ? '☑ Route Around'
                                        : '☐ Route Around'
                                }
                                x={LINK.ROUTE_AROUND_X_OFFSET}
                                y={LINK.ROUTE_AROUND_Y_OFFSET}
                                width={LINK.CONTROL_BUTTON_WIDTH}
                                height={LINK.CONTROL_BUTTON_HEIGHT}
                                fontSize={LINK.ROUTE_AROUND_FONT_SIZE}
                                fontFamily={TEXT.FONT_FAMILY}
                                fill={COLORS.TEXT_WHITE}
                                align={TEXT.ALIGN_CENTER}
                                verticalAlign={TEXT.VERTICAL_ALIGN_MIDDLE}
                                onClick={handleRouteAroundToggle}
                                onTap={handleRouteAroundToggle}
                            />
                        </>
                    )}
                </Group>
            )}
        </>
    )
}

export default Link
