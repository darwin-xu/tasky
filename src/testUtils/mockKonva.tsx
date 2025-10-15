import React from 'react'

type Pointer = {
    x: number
    y: number
}

type StageEventHandlers = {
    onMouseDown?: (event: any) => void
    onMouseMove?: (event: any) => void
    onMouseUp?: (event: any) => void
    onMouseLeave?: (event: any) => void
    onWheel?: (event: any) => void
    onTouchStart?: (event: any) => void
    onTouchMove?: (event: any) => void
    onTouchEnd?: (event: any) => void
}

type StageLikeProps = StageEventHandlers & {
    children?: React.ReactNode
    width?: number
    height?: number
    x?: number
    y?: number
    scaleX?: number
    scaleY?: number
    className?: string
    style?: React.CSSProperties
    draggable?: boolean
}

const defaultPointers = {
    initial: { x: 100, y: 100 } satisfies Pointer,
    move: { x: 150, y: 120 } satisfies Pointer,
    wheel: { x: 400, y: 300 } satisfies Pointer,
}

const createKonvaEvent = (target: any, nativeEvent: any) => ({
    target,
    evt: nativeEvent,
})

const Stage = React.forwardRef<any, StageLikeProps>((props, forwardedRef) => {
    const {
        children,
        width,
        height,
        x,
        y,
        scaleX,
        scaleY,
        className,
        style,
        draggable,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave,
        onWheel,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
    } = props

    const pointerRef = React.useRef<Pointer>({ ...defaultPointers.initial })
    const stageInstanceRef = React.useRef<any>()

    if (!stageInstanceRef.current) {
        stageInstanceRef.current = {
            getPointerPosition: () => pointerRef.current,
            getStage: () => stageInstanceRef.current,
        }
    }

    React.useImperativeHandle(forwardedRef, () => stageInstanceRef.current, [])

    const wrapHandler = (
        handler: StageLikeProps[keyof StageEventHandlers],
        pointerValue?: Pointer
    ) =>
        handler
            ? (event: any) => {
                  if (pointerValue) {
                      pointerRef.current = { ...pointerValue }
                  }
                  const nativeEvent = event?.nativeEvent ?? event
                  if (
                      nativeEvent &&
                      typeof nativeEvent.preventDefault !== 'function'
                  ) {
                      nativeEvent.preventDefault = () => {}
                  }
                  handler(
                      createKonvaEvent(stageInstanceRef.current, nativeEvent)
                  )
              }
            : undefined

    return (
        <div
            data-testid="konva-stage"
            data-width={width}
            data-height={height}
            data-x={x}
            data-y={y}
            data-scale-x={scaleX}
            data-scale-y={scaleY}
            className={className}
            style={style}
            draggable={draggable}
            onMouseDown={wrapHandler(onMouseDown, defaultPointers.initial)}
            onMouseMove={wrapHandler(onMouseMove, defaultPointers.move)}
            onMouseUp={wrapHandler(onMouseUp, defaultPointers.move)}
            onMouseLeave={wrapHandler(onMouseLeave, defaultPointers.initial)}
            onWheel={wrapHandler(onWheel, defaultPointers.wheel)}
            onTouchStart={wrapHandler(onTouchStart, defaultPointers.initial)}
            onTouchMove={wrapHandler(onTouchMove, defaultPointers.move)}
            onTouchEnd={wrapHandler(onTouchEnd, defaultPointers.move)}
        >
            {children}
        </div>
    )
})
Stage.displayName = 'MockStage'

const Layer = React.forwardRef<HTMLDivElement, { children?: React.ReactNode }>(
    ({ children }, ref) => (
        <div ref={ref} data-testid="konva-layer">
            {children}
        </div>
    )
)
Layer.displayName = 'MockLayer'

const Group = React.forwardRef<
    HTMLDivElement,
    {
        children?: React.ReactNode
        draggable?: boolean
        x?: number
        y?: number
        onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void
        onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void
        onDragMove?: (event: React.DragEvent<HTMLDivElement>) => void
        onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
        onDblClick?: (event: React.MouseEvent<HTMLDivElement>) => void
        onTap?: (event: React.TouchEvent<HTMLDivElement>) => void
    }
>(
    (
        {
            children,
            draggable,
            x,
            y,
            onDragStart,
            onDragEnd,
            onClick,
            onDblClick,
            onTap,
        },
        ref
    ) => (
        <div
            ref={ref}
            data-testid="konva-group"
            draggable={!!draggable}
            data-x={x}
            data-y={y}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onClick}
            onDoubleClick={onDblClick}
        >
            {children}
        </div>
    )
)
Group.displayName = 'MockGroup'

const Rect = React.forwardRef<
    HTMLDivElement,
    {
        width?: number
        height?: number
        fill?: string
        stroke?: string
        strokeWidth?: number
        dash?: number[]
        cornerRadius?: number | number[]
        shadowColor?: string
        shadowBlur?: number
        shadowOpacity?: number
        shadowOffsetX?: number
        shadowOffsetY?: number
    }
>(
    (
        {
            width,
            height,
            fill,
            stroke,
            strokeWidth,
            dash,
            cornerRadius,
            shadowColor,
            shadowBlur,
            shadowOpacity,
            shadowOffsetX,
            shadowOffsetY,
        },
        ref
    ) => (
        <div
            ref={ref}
            data-testid="konva-rect"
            data-width={width}
            data-height={height}
            data-fill={fill}
            data-stroke={stroke}
            data-stroke-width={strokeWidth}
            data-dash={dash ? JSON.stringify(dash) : undefined}
            data-corner-radius={
                typeof cornerRadius === 'object'
                    ? JSON.stringify(cornerRadius)
                    : cornerRadius
            }
            data-shadow-color={shadowColor}
            data-shadow-blur={shadowBlur}
            data-shadow-opacity={shadowOpacity}
            data-shadow-offset-x={shadowOffsetX}
            data-shadow-offset-y={shadowOffsetY}
        />
    )
)
Rect.displayName = 'MockRect'

const Text = React.forwardRef<
    HTMLDivElement,
    {
        text?: string
        x?: number
        y?: number
        width?: number
        height?: number
        align?: string
        verticalAlign?: string
    }
>(({ text, x, y, width, height, align, verticalAlign }, ref) => (
    <div
        ref={ref}
        data-testid="konva-text"
        data-text={text}
        data-x={x}
        data-y={y}
        data-width={width}
        data-height={height}
        data-align={align}
        data-vertical-align={verticalAlign}
    />
))
Text.displayName = 'MockText'

const Circle = React.forwardRef<
    HTMLDivElement,
    {
        x?: number
        y?: number
        radius?: number
        fill?: string
    }
>(({ x, y, radius, fill }, ref) => (
    <div
        ref={ref}
        data-testid="konva-circle"
        data-x={x}
        data-y={y}
        data-radius={radius}
        data-fill={fill}
    />
))
Circle.displayName = 'MockCircle'

export { Stage, Layer, Group, Rect, Text, Circle }
