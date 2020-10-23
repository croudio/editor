import React, { FC, memo } from 'react'
import styled from 'styled-components'
import { Bounds } from '../typings'
import { themeGet } from '@styled-system/theme-get'

const StyledSelection = styled.rect`
    ${themeGet('selection.default')}
    stroke-dasharray: 5,5;
`

const Selection: FC<Bounds> = (props) => {

    return <StyledSelection pointerEvents="none" {...props} />
}

export default memo(Selection, (prev, next) => {
    return prev.x === next.x &&
        prev.y === next.y &&
        prev.width === next.width &&
        prev.height === next.height
});