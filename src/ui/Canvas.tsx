import React, { PointerEvent, FC, useState } from 'react';
import { Position, Size } from '../typings';

export interface Props extends Size {
    onMove?: (position: Position) => void
}

const Canvas: FC<Props> = ({ width, height, onMove, ...rest }) => {

    const [isDown, setDown] = useState<boolean>(false);

    const handleMove = (e: PointerEvent) => {


        e.preventDefault();

        if (!isDown || !onMove) return;

        const box = e.currentTarget.getBoundingClientRect();

        onMove({
            x: e.clientX - box.left,
            y: e.clientY - box.top
        })
    }

    const handleDown = (e: PointerEvent) => {
        setDown(true);
    }

    const handleUp = (e: PointerEvent) => {
        setDown(false);
    }


    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerLeave={handleUp}
            {...rest}
        />
    )

}

export default Canvas