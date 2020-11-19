import { ReactElement } from "react"


export interface Position {
    x: number,
    y: number,
}

export interface Size {
    width: number,
    height: number
}


export interface Element extends Size, Position {
    id: string;
}

export type Selection = Element["id"][]

export interface Bounds extends Position, Size { }

export interface Locator {
    id: string;
    time: number;
}

export enum Tool {
    Pointer = "pointer",
    Pencil = "pencil",
    Lasso = "lasso",
    Eraser = "eraser",
    Scissor = "scissor"
}

export enum Mode {
    Default = "default",
    Special = "special"
}

export enum Change {
    Set = "Set",
    Add = "Add",
    Update = "Update",
    Remove = "Remove",
    Select = "Select",
    KeyUp = "KeyUp",
    KeyDown = "KeyDown"
}

export interface Set {
    type: Change.Set,
    elements: Element[]
}

export interface Add {
    type: Change.Add,
    element: Element
}

export interface Update {
    type: Change.Update,
    element: Element
}

export interface Remove {
    type: Change.Remove,
    element: Element
}

export interface Select {
    type: Change.Select,
    selection: Selection
}

export type ElementEvent = Add | Update | Remove
export type EditorEvent = Select
export type ChangeEvent = Set | ElementEvent | EditorEvent

export enum Target {
    Grid = "Grid",
    Element = "Element"
}

interface AnyAction {
    type: any;
}

export const isSetEvent = (change: AnyAction): change is Set => change.type === Change.Set
export const isAddEvent = (change: AnyAction): change is Add => change.type === Change.Add
export const isUpdateEvent = (change: AnyAction): change is Update => change.type === Change.Update
export const isRemoveEvent = (change: AnyAction): change is Remove => change.type === Change.Remove

export const isElementEvent = (change: AnyAction): change is ElementEvent => [Change.Add, Change.Update, Change.Remove].includes(change.type)
export const isEditorEvent = (change: AnyAction): change is EditorEvent => [Change.Select].includes(change.type)

export type Callback = (helpers: Helpers) => void;

export interface Settings {
    size: Size,
    grid: Size,
    quantize: Size,
    offset: Position,
    snapToGrid: boolean,
    zoom: Position,
}

export interface Helpers extends Settings {
    changes: ChangeEvent[],
    bounds?: Bounds,
    selection: Selection,
    elements: Element[],
    generateId: () => string,
    select: (selection: Selection) => void,
    onChange: (changes: ChangeEvent[]) => void,
    blocks: ReactElement[]
    tool: Tool,
    mode: Mode,
    target?: Target,
    down: boolean,
    pointerOffset?: Position,
    pointerPosition?: Position,
    pointerElement?: Element,
    setChanges: (changes: ChangeEvent[]) => void,
    // selectAll: () => void,
    deselectAll: () => void,
    // moveSelection: (transition: Position) => void,
    // duplicateSelection: () => void,
    // deleteSelection: () => void,
    setZoom: (zoom: Position) => void
    resetZoom: () => void
    multiplyZoom: (transition: Position) => void,
    setOffset: (offset: Position) => void,
    resetOffset: () => void,
    transposeOffset: (transition: Position) => void,
    setTool: (tool: Tool) => void,
    setMode: (mode: Mode) => void,
    onDown: (position: Position) => void,
    onUp: (position: Position) => void,
    onMove: (offset: Position) => void,
    isSelected: (element: Element) => boolean,
    isChanged: (element: Element) => void,
}

export type Helper = (helpers: Helpers) => void

export type Plugin = (helpers: Helpers) => Function | void
