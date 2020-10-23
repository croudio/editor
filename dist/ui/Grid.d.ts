import React from 'react';
import { Position, Size } from '../typings';
export interface Props extends Size, Partial<Position> {
    id: string;
    color: string;
    grid: Size;
    offset: Position;
}
declare const _default: React.NamedExoticComponent<Props>;
export default _default;
