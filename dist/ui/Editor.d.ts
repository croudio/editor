import { FC, ReactElement } from 'react';
import { Size, Position, Locator, Bounds, Tool } from '../typings';
interface Props extends Size {
    id: string;
    grid: Size;
    quantize: Size;
    zoom: Position;
    offset: Position;
    locators: Locator[];
    blocks: ReactElement[];
    bounds?: Bounds;
    tool: Tool;
    onDown?: (position: Position) => void;
    onUp?: (position: Position) => void;
    onMove?: (offset: Position) => void;
}
declare const Editor: FC<Props>;
export default Editor;
