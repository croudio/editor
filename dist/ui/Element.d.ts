import React from 'react';
import { Size, Position } from '../typings';
export interface Props extends Position, Size {
    id: string;
    selected?: boolean;
    active?: boolean;
    moving?: boolean;
}
declare const _default: React.MemoExoticComponent<({ id, x, y, width, height, selected, moving, active }: Props) => JSX.Element>;
export default _default;
