import React, { FC, HTMLProps } from 'react'
import styled from 'styled-components'
import { themeGet } from '@styled-system/theme-get'


interface LineProps extends HTMLProps<SVGLineElement> {
    active: boolean
}

const Line = styled.line<LineProps>`
    ${ themeGet('locator.default')}
    ${ props => props.active && themeGet('locator.active')(props)}
`

export interface Props {
    x: number,
    active: boolean
}

export const Locator: FC<Props> = ({ x, active }) => {

    return <Line x1={x} x2={x} y1={0} y2="100%" active={active} />
}

export default Locator