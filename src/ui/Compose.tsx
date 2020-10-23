import React, { FC } from 'react'
import { Size, Bounds } from '../typings'
import Canvas from './Canvas';

export enum Align {
    Left = "left",
    Top = "top",
    Right = "right",
    Bottom = "bottom"
}

export interface Tree {
    first?: string | Tree,
    second?: string | Tree,
    align: Align,
    split: number
}

export interface Component {
    id: string,
    render: FC<Size>,
}

export interface Props extends Size {
    tree: Tree,
    components: Component[]
}

const renderComponent = (item: Tree | string, components: Component[], size: Size) => typeof item === "string"
    ? components.find(component => component.id === item)?.render(size)
    : Compose({
        ...size,
        tree: item,
        components
    })

const getBounds = (align: Align, { width, height }: Size, split: number): [Bounds, Bounds] => {

    switch (align) {

        case Align.Bottom: {
            return [
                {
                    x: 0,
                    y: 0,
                    height: split > 1 ? height - split : height - split * height,
                    width,
                },
                {
                    x: 0,
                    y: split > 1 ? height - split : height - split * height,
                    height: split > 1 ? split : split * height,
                    width,
                },
            ]
        }

        case Align.Right: {
            return [
                {
                    x: 0,
                    y: 0,
                    width: split > 1 ? width - split : width - split * width,
                    height,
                },
                {
                    x: split > 1 ? width - split : width - split * width,
                    y: 0,
                    width: split > 1 ? split : split * width,
                    height,
                },
            ]
        }

        case Align.Left: {
            return [
                {
                    x: 0,
                    y: 0,
                    width: split > 1 ? split : split * width,
                    height,
                },
                {
                    x: split > 1 ? split : split * width,
                    y: 0,
                    width: split > 1 ? width - split : width - split * width,
                    height,
                },
            ]
        }

        case Align.Top: {
            return [
                {
                    x: 0,
                    y: 0,
                    width,
                    height: split > 1 ? split : split * height,
                },
                {
                    x: 0,
                    y: split > 1 ? split : split * height,
                    width,
                    height: split > 1 ? height - split : height - split * height,
                },
            ]
        }
    }
}

const Compose: FC<Props> = ({ width, height, tree, components }) => {

    const { first, second, align, split } = tree;

    const [a, b] = getBounds(align, { width, height }, split);

    return <Canvas width={width} height={height}>
        <g transform={`translate(${a.x},${a.y})`}>
            <Canvas width={a.width} height={a.height}>
                {first && renderComponent(first, components, a)}
            </Canvas>
        </g>
        <g transform={`translate(${b.x},${b.y})`}>
            <Canvas width={b.width} height={b.height}>
                {second && renderComponent(second, components, b)}
            </Canvas>
        </g>
    </Canvas>
}


export default Compose