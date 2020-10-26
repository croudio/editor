import React, { FC, ReactElement } from 'react'
import { Size, Position, Locator, Bounds, Tool } from '../typings'
import Grid from './Grid'
import Selection from './Selection'
import Overlay from './Overlay'
import LocatorUI from './Locator'

type HandleElement = (position: Position) => void

interface Props {
    id: string,
    size: Size,
    grid: Size,
    quantize: Size,
    zoom: Position,
    offset: Position,
    locators: Locator[],
    blocks: ReactElement[]
    bounds?: Bounds,
    tool: Tool,
    onDown?: HandleElement,
    onUp?: HandleElement,
    onMove?: HandleElement,
}

const Editor: FC<Props> = ({ id, size, grid, quantize, zoom, offset, locators, blocks, bounds, tool, onDown, onUp, onMove }) => {

    return (
        <g>
            <Grid
                {...size}
                id={`${id}-small`}
                color="lightGrey"
                grid={{
                    width: zoom.x * grid.width / quantize.width,
                    height: zoom.y * grid.height / quantize.height
                }}
                offset={offset}
            />
            <Grid
                {...size}
                id={`${id}-large`}
                color="grey"
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
                {...size}
                tool={tool}
                onDown={onDown}
                onUp={onUp}
                onMove={onMove}
            />
        </g>
    )

}

export default Editor