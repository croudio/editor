export interface Position {
    x: number;
    y: number;
}
export interface Size {
    width: number;
    height: number;
}
export interface Element extends Size, Position {
    id: string;
}
export declare type Selection = Element["id"][];
export interface Bounds extends Position, Size {
}
export interface Locator {
    id: string;
    time: number;
}
export declare enum Tool {
    Pointer = "pointer",
    Pencil = "pencil",
    Lasso = "lasso",
    Eraser = "eraser",
    Scissor = "scissor"
}
export declare enum Mode {
    Default = "default",
    Special = "special"
}
export declare enum Change {
    Add = "Add",
    Update = "Update",
    Remove = "Remove",
    Select = "Select"
}
export interface Add {
    type: Change.Add;
    element: Element;
}
export interface Update {
    type: Change.Update;
    element: Element;
}
export interface Remove {
    type: Change.Remove;
    element: Element;
}
export interface Select {
    type: Change.Select;
    selection: Selection;
}
export declare type ElementEvent = Add | Update | Remove;
export declare type EditorEvent = Select;
export declare type ChangeEvent = ElementEvent | EditorEvent;
export declare enum Target {
    Grid = "Grid",
    Element = "Element"
}
interface AnyAction {
    type: any;
}
export declare const isAddEvent: (change: AnyAction) => change is Add;
export declare const isUpdateEvent: (change: AnyAction) => change is Update;
export declare const isRemoveEvent: (change: AnyAction) => change is Remove;
export declare const isElementEvent: (change: AnyAction) => change is ElementEvent;
export declare const isEditorEvent: (change: AnyAction) => change is Select;
export {};
