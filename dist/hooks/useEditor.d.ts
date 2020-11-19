import { ReactElement } from "react";
import { ChangeEvent, Callback, Element, Size, Plugin, Helpers } from "../typings";
export interface RenderElementProps extends Element {
    selected: boolean;
    moving: boolean;
}
export declare type KeyHandler = Callback | [Callback, Callback];
export interface Props {
    elements?: Element[];
    renderElement: (props: RenderElementProps) => ReactElement;
    size: Size;
    grid: Size;
    quantize: Size;
    snapToGrid: boolean;
    generateId: () => string;
    onChange?: (changes: ChangeEvent[]) => void;
    keys?: Record<string, KeyHandler>;
    plugins?: Plugin[];
}
declare const _default: ({ elements: defaultElements, renderElement, size, grid, quantize, snapToGrid, onChange, generateId: customGenerateId, keys, plugins }: Props) => Helpers;
export default _default;
