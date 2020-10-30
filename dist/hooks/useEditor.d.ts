import { ReactElement } from "react";
import { Position, Bounds, ChangeEvent, Element, Selection, Tool, Mode, Size, Plugin } from "../typings";
export interface Settings {
    size: Size;
    grid: Size;
    quantize: Size;
    offset: Position;
    snapToGrid: boolean;
    zoom: Position;
}
export interface RenderElementProps extends Element {
    selected: boolean;
    moving: boolean;
}
declare type Callback = (helpers: WithEditor) => void;
export declare type KeyHandler = Callback | [Callback, Callback];
interface WithEditor extends Settings {
    changes: ChangeEvent[];
    bounds?: Bounds;
    selection: Selection;
    elements: Element[];
    generateId: () => string;
    select: (selection: Selection) => void;
    onChange: (changes: ChangeEvent[]) => void;
    blocks: ReactElement[];
    tool: Tool;
    mode: Mode;
    selectAll: () => void;
    deselectAll: () => void;
    moveSelection: (transition: Position) => void;
    deleteSelection: () => void;
    setZoom: (zoom: Position) => void;
    resetZoom: () => void;
    multiplyZoom: (transition: Position) => void;
    setOffset: (offset: Position) => void;
    resetOffset: () => void;
    transposeOffset: (transition: Position) => void;
    setTool: (tool: Tool) => void;
    setMode: (mode: Mode) => void;
    onDown: (position: Position) => void;
    onUp: (position: Position) => void;
    onMove: (offset: Position) => void;
    isSelected: (element: Element) => boolean;
    isChanged: (element: Element) => void;
}
export interface Props {
    elements: Element[];
    renderElement: (props: RenderElementProps) => ReactElement;
    size: Size;
    grid: Size;
    quantize: Size;
    snapToGrid: boolean;
    generateId: () => string;
    onChange: (changes: ChangeEvent[]) => void;
    keys?: Record<string, KeyHandler>;
    plugins?: Plugin[];
}
declare const _default: ({ elements, renderElement, size, grid, quantize, snapToGrid, onChange, generateId: customGenerateId, keys, plugins }: Props) => WithEditor;
export default _default;
