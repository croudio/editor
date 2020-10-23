import { FC } from 'react';
import { Position, Size } from '../typings';
export interface Props extends Size {
    onMove?: (position: Position) => void;
}
declare const Canvas: FC<Props>;
export default Canvas;
