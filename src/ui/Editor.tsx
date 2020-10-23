import React, { FC, ReactElement } from 'react'
import { Size, Position, Locator, Bounds, Tool } from '../typings'
import Grid from './Grid'
import Selection from './Selection'
import Overlay from './Overlay'
import LocatorUI from './Locator'


interface Props extends Size {
    id: string,
    grid: Size,
    quantize: Size,
    zoom: Position,
    offset: Position,
    locators: Locator[],
    blocks: ReactElement[]
    bounds?: Bounds,
    tool: Tool,
    onDown?: (position: Position) => void,
    onUp?: (position: Position) => void,
    onMove?: (offset: Position) => void,
}

const Editor: FC<Props> = ({ id, width, height, grid, quantize, zoom, offset, locators, blocks, bounds, tool, onDown, onUp, onMove }) => {

    return (
        <g>
            <Grid
                id={`${id}-small`}
                color="lightGrey"
                width={width}
                height={height}
                grid={{
                    width: zoom.x * grid.width / quantize.width,
                    height: zoom.y * grid.height / quantize.height
                }}
                offset={offset}
            />
            <Grid
                id={`${id}-large`}
                color="grey"
                width={width}
                height={height}
                grid={{
                    width: zoom.x * grid.width,
                    height: zoom.y * grid.height
                }}
                offset={offset}
            />
            {locators.map(locator => (
                <LocatorUI key={locator.id} x={locator.time * grid.width / quantize.width} active={locator.id !== "time"} />
            ))}
            {blocks}
            {bounds && <Selection {...bounds} />}
            <Overlay
                width={width}
                height={height}
                tool={tool}
                onDown={onDown}
                onUp={onUp}
                onMove={onMove}
            />
        </g>
    )

}

export default Editor