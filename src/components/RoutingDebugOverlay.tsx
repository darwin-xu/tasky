import React from 'react'
import { Rect, Group } from 'react-konva'
import { LINK } from '../constants'

interface Card {
    x: number
    y: number
    width: number
    height: number
}

interface RoutingDebugOverlayProps {
    cards: Card[]
    viewport: {
        x: number
        y: number
        scale: number
    }
    stageWidth: number
    stageHeight: number
}

const RoutingDebugOverlay: React.FC<RoutingDebugOverlayProps> = ({
    cards,
    viewport,
    stageWidth,
    stageHeight,
}) => {
    const padding = LINK.OBSTACLE_PADDING

    // Calculate visible area in world coordinates
    const visibleWorldX = -viewport.x / viewport.scale
    const visibleWorldY = -viewport.y / viewport.scale
    const visibleWorldWidth = stageWidth / viewport.scale
    const visibleWorldHeight = stageHeight / viewport.scale

    return (
        <Group>
            {/* Render padded areas around each card */}
            {cards.map((card, index) => {
                const paddedX = card.x - padding
                const paddedY = card.y - padding
                const paddedWidth = card.width + padding * 2
                const paddedHeight = card.height + padding * 2

                // Check if card is in visible area
                if (
                    paddedX + paddedWidth < visibleWorldX ||
                    paddedX > visibleWorldX + visibleWorldWidth ||
                    paddedY + paddedHeight < visibleWorldY ||
                    paddedY > visibleWorldY + visibleWorldHeight
                ) {
                    return null // Skip cards outside viewport
                }

                return (
                    <Group key={`debug-${index}`}>
                        {/* Padded area - the "no-go zone" for routing */}
                        <Rect
                            x={paddedX}
                            y={paddedY}
                            width={paddedWidth}
                            height={paddedHeight}
                            fill="rgba(255, 100, 100, 0.2)"
                            stroke="rgba(255, 0, 0, 0.4)"
                            strokeWidth={1}
                            listening={false}
                        />
                        {/* Card itself - darker overlay */}
                        <Rect
                            x={card.x}
                            y={card.y}
                            width={card.width}
                            height={card.height}
                            fill="rgba(255, 50, 50, 0.3)"
                            stroke="rgba(200, 0, 0, 0.6)"
                            strokeWidth={2}
                            listening={false}
                        />
                    </Group>
                )
            })}
        </Group>
    )
}

export default RoutingDebugOverlay
