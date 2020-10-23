import React, { PointerEvent, FC, memo, useCallback } from 'react'
import { Position, Size, Tool } from '../typings';

export interface Props extends Partial<Position>, Size {
    tool: Tool;
    onDown?: (position: Position) => void
    onUp?: (position: Position) => void
    onMove?: (position: Position) => void
    onEnter?: (position: Position) => void
    onLeave?: (position: Position) => void
}

const getCursor = (tool: Tool) => {

    switch (tool) {

        case Tool.Pointer:
            return "move"

        case Tool.Pencil:
            return "e-resize"

        case Tool.Scissor:
            return "col-resize"

        default:
            return "pointer"
    }
}

const Overlay: FC<Props> = ({ x = 0, y = 0, width, height, tool, onDown, onUp, onMove, onEnter, onLeave }) => {

    const handleDown = useCallback((e: PointerEvent) => {

        e.preventDefault();

        if (e.target !== e.currentTarget) return;

        const box = e.currentTarget.getBoundingClientRect();

        const test = {
            x: e.clientX - box.left + x,
            y: e.clientY - box.top + y
        }

        onDown && onDown(test)
    }, [onDown, x, y])

    const handleUp = useCallback((e: PointerEvent) => {

        e.preventDefault();

        if (e.target !== e.currentTarget) return;

        const box = e.currentTarget.getBoundingClientRect();

        const position = {
            x: e.clientX - box.left,
            y: e.clientY - box.top
        }

        onUp && onUp(position);
    }, [onUp])


    const handleMove = (e: PointerEvent) => {

        e.preventDefault();

        if (!onMove) return;

        const box = e.currentTarget.getBoundingClientRect();

        onMove({
            x: e.clientX - box.left,
            y: e.clientY - box.top
        })
    }

    const handleEnter = useCallback((e: PointerEvent) => {

        e.preventDefault();

        if (e.target !== e.currentTarget) return;

        const box = e.currentTarget.getBoundingClientRect();

        const test = {
            x: e.clientX - box.left + x,
            y: e.clientY - box.top + y
        }

        onEnter && onEnter(test)
    }, [onEnter, x, y])

    const handleLeave = useCallback((e: PointerEvent) => {

        e.preventDefault();

        if (e.target !== e.currentTarget) return;

        const box = e.currentTarget.getBoundingClientRect();

        const test = {
            x: e.clientX - box.left + x,
            y: e.clientY - box.top + y
        }

        onLeave && onLeave(test)
    }, [onLeave, x, y])


    return (
        <rect
            width={width}
            height={height}
            fill="none"
            pointerEvents="all"
            style={{
                cursor: getCursor(tool)
            }}
            onPointerDown={handleDown}
            onPointerUp={handleUp}
            onPointerMove={handleMove}
            onPointerEnter={handleEnter}
            onPointerLeave={handleLeave}
        />

    )
}

// export default Overley
export default memo(Overlay, (prev, next) => {

    return prev.x === next.x &&
        prev.y === next.y &&
        prev.width === next.width &&
        prev.height === next.height &&
        prev.tool === next.tool

}) 