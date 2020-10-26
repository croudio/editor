import { FC, ReactElement } from 'react';
import { Size, Position, Locator, Bounds, Tool } from '../typings';
declare type HandleElement = (position: Position) => void;
interface Props {
    id: string;
    size: Size;
    grid: Size;
    quantize: Size;
    zoom: Position;
    offset: Position;
    locators: Locator[];
    blocks: ReactElement[];
    bounds?: Bounds;
    tool: Tool;
    onDown?: HandleElement;
    onUp?: HandleElement;
    onMove?: HandleElement;
}
declare const Editor: FC<Props>;
export default Editor;
