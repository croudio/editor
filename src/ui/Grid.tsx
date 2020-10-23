import React, { FC, memo } from 'react'
import { Position, Size } from '../typings';

export interface Props extends Size, Partial<Position> {
    id: string,
    color: string,
    grid: Size
    offset: Position
}

const Grid: FC<Props> = ({ id, x = 0, y = 0, width, height, color, grid, offset }) => {

    return (<>
        <defs>
            <pattern id={id} x={-offset.x} y={-offset.y} width={grid.width} height={grid.height} patternUnits="userSpaceOnUse">
                <path d={`M ${grid.width} 0 L 0 0 0 ${grid.height}`} fill="none" stroke={color} strokeWidth="0.5" />
            </pattern>
        </defs>
        <g transform={`translate(${x},${y})`}>
            <rect id="grid" width={width} height={height} fill={`url(#${id})`} />
        </g>
    </>
    )
}

// export default Grid
export default memo(Grid, (prev, next) => {

    return prev.id === next.id &&
        prev.color === next.color &&
        prev.x === next.x &&
        prev.y === next.y &&
        prev.offset.x === next.offset.x &&
        prev.offset.y === next.offset.y &&
        prev.width === next.width &&
        prev.height === next.height &&
        prev.grid.width === next.grid.width &&
        prev.grid.height === next.grid.height
}) 