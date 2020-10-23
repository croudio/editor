import React from 'react';
import { Position, Size, Tool } from '../typings';
export interface Props extends Partial<Position>, Size {
    tool: Tool;
    onDown?: (position: Position) => void;
    onUp?: (position: Position) => void;
    onMove?: (position: Position) => void;
    onEnter?: (position: Position) => void;
    onLeave?: (position: Position) => void;
}
declare const _default: React.NamedExoticComponent<Props>;
export default _default;
