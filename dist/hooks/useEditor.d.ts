import { ReactElement } from "react";
import { Position, Bounds, ChangeEvent, Element, Selection, Tool, Mode, Size } from "../typings";
export interface Settings {
    dimensions: Size;
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
    blocks: ReactElement[];
    tool: Tool;
    mode: Mode;
    selectAll: () => void;
    deselectAll: () => void;
    moveSelection: (transition: Position) => void;
    duplicateSelection: () => void;
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
    isSelected: (element: Element) => void;
    isChanged: (element: Element) => void;
}
interface Props {
    elements: Element[];
    renderElement: (props: RenderElementProps) => ReactElement;
    dimensions: Size;
    grid: Size;
    quantize: Size;
    snapToGrid: boolean;
    generateId: () => string;
    onChange: (changes: ChangeEvent[]) => void;
    keys?: Record<string, KeyHandler>;
}
declare const _default: ({ elements, renderElement, dimensions, grid, quantize, snapToGrid, onChange, generateId: customGenerateId, keys }: Props) => WithEditor;
export default _default;
