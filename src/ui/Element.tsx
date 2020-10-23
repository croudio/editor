import React, { FC, HTMLProps, memo } from 'react'
import styled from 'styled-components';
import { Size, Position } from '../typings';
import { themeGet } from '@styled-system/theme-get'

interface ElementProps extends HTMLProps<SVGRectElement> {
    selected: boolean;
    active: boolean;
    moving: boolean;
}

const StyledElement: FC<ElementProps> = styled.rect<ElementProps>`
    ${themeGet('element.default')}
    ${props => props.active && themeGet('element.active')(props)}
    ${props => props.selected && themeGet('element.selected')(props)}
    ${props => props.moving && themeGet('element.moving')(props)}
    cursor: pointer;
`


export interface Props extends Position, Size {
    id: string;
    selected?: boolean
    active?: boolean
    moving?: boolean
}


const Element = ({ id, x, y, width, height, selected, moving, active }: Props) => {

    return (
        <g transform={`translate(${x},${y})`}>
            <StyledElement
                width={width}
                height={height}
                selected={!!selected}
                moving={!!moving}
                active={!!active}
            />
            <rect x={width - 5} width={5} height={height} style={{ fill: "none" }}></rect>
        </g>
    )

}

// export default Element
export default memo(Element, (prev, next) => {

    return prev.id === next.id &&
        prev.width === next.width &&
        prev.height === next.height &&
        prev.x === next.x &&
        prev.y === next.y &&
        prev.selected === next.selected &&
        prev.moving === next.moving &&
        prev.active === next.active
})