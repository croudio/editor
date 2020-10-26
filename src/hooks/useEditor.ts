import { useEffect, useState, ReactElement } from "react";
import { Position, Bounds, ChangeEvent, Target, isAddEvent, Change, Add, Update, Element, ElementEvent, Selection, isElementEvent, Tool, Mode, Size, Remove } from "../typings";
import { calculateBounds, isInBounds, getUpperBounds } from "../utils/selection";
import { snapTo, floorTo } from "../utils/numbers";
import uniqBy from 'lodash/fp/uniqBy';
import compose from 'lodash/fp/compose';
import sortBy from 'lodash/fp/sortBy';
import keyboardJS from 'keyboardjs';
import { v4 as uuid } from 'uuid';


export interface Settings {
    grid: Size,
    quantize: Size,
    offset: Position,
    snapToGrid: boolean,
    zoom: Position,
}

export interface RenderElementProps extends Element {
    selected: boolean
    moving: boolean
}


type Callback = (helpers: WithEditor) => void;

export type KeyHandler = Callback | [Callback, Callback]

interface WithEditor extends Settings {
    changes: ChangeEvent[],
    bounds?: Bounds,
    selection: Selection,
    blocks: ReactElement[]
    tool: Tool,
    mode: Mode,
    selectAll: () => void,
    deselectAll: () => void,
    moveSelection: (transition: Position) => void,
    duplicateSelection: () => void,
    deleteSelection: () => void,
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
    isSelected: (element: Element) => void,
    isChanged: (element: Element) => void,
}

interface Props {
    elements: Element[],
    renderElement: (props: RenderElementProps) => ReactElement
    grid: Size,
    quantize: Size,
    snapToGrid: boolean,
    generateId: () => string,
    onChange: (changes: ChangeEvent[]) => void,
    keys?: Record<string, KeyHandler>
}

export default ({ elements, renderElement, grid, quantize, snapToGrid, onChange, generateId: customGenerateId, keys }: Props): WithEditor => {

    const generateId = customGenerateId || uuid;

    const [selection, select] = useState<Selection>([]);
    const [zoom, setZoom] = useState<Position>({ x: 1, y: 1 })
    const [offset, setOffset] = useState<Position>({ x: 0, y: 0 })
    const [tool, setTool] = useState(Tool.Pointer);
    const [mode, setMode] = useState(Mode.Default);

    // Track pointer movement
    const [pointerPosition, setPointerPosition] = useState<Position>({ x: 0, y: 0 })
    const [pointerOffset, setPointerOffset] = useState<Position | undefined>()

    // Track pointer selection
    const [down, setDown] = useState<boolean>(false)
    const [target, setTarget] = useState<Target | undefined>()

    // Keep track of local changes, that do not directly bubble to the outside.
    const [changes, setChanges] = useState<ChangeEvent[]>([])

    // Used as temporary id for creating and updating elements
    const [id, setId] = useState<string>(generateId ? generateId() : uuid)


    /**
     * Helpers
     */
    const isSelected = (element: Element) => selection.includes(element.id)

    const isChanged = (element: Element) => changes
        .filter(isElementEvent)
        .some(change => change.element.id === element.id);

    const selectAll = () => select(elements.map(element => element.id))

    const deselectAll = () => select([])

    const moveSelection = (transition: Position) => {

        const changes = elements
            .filter(element => selection.includes(element.id))
            .map<Update>(element => ({
                type: Change.Update,
                element: {
                    ...element,
                    x: element.x + transition.x,
                    y: element.y + transition.y
                }
            }))

        onChange && onChange(changes)
    }

    const duplicateSelection = () => {

        const selected = elements
            .filter(element => selection.includes(element.id));

        const bounds = getUpperBounds(selected)

        const changes = selected.map<Add>(element => ({
            type: Change.Add,
            element: {
                ...element,
                id: generateId(),
                x: element.x + bounds.width - bounds.x,
            }
        }))

        onChange && onChange(changes);

        select(changes.map(change => change.element.id))
    }

    const deleteSelection = () => {

        const changes = elements
            .filter(element => selection.includes(element.id))
            .map<Remove>(element => ({ type: Change.Remove, element }))

        onChange && onChange(changes)
    }


    const resetZoom = () => {
        setZoom({ x: 1, y: 1 })
    }

    const multiplyZoom = (transition: Position) => {
        setZoom({
            x: zoom.x * transition.x,
            y: zoom.y * transition.y,
        })
    }

    const transposeOffset = (transition: Position) => {
        setOffset({
            x: offset.x + transition.x,
            y: offset.y + transition.y,
        })
    }

    const resetOffset = () => {
        setOffset({ x: 0, y: 0 })
    }

    const onMove = (position: Position) => {
        setPointerOffset(position);
    }

    const onDown = (position: Position) => {
        setDown(true);
        setPointerPosition(position);
        setPointerOffset(undefined);
    }

    const onUp = (position: Position) => {
        setDown(false);
    }

    const flushChanges = (changes: ChangeEvent[]) => {
        onChange && changes.length && onChange(changes)
        setChanges([]);
    }




    const bounds = target === Target.Grid && tool === Tool.Pointer && down && pointerOffset
        ? calculateBounds(pointerPosition, pointerOffset)
        : undefined;


    // Merge the original elements with the local changes.
    const elementsWithChanges: Element[] = compose(
        uniqBy("id"),
        sortBy(isSelected)
    )([
        ...changes
            .filter(isElementEvent)
            .map(change => change.element),
        ...elements
    ])

    const blocks = elementsWithChanges.map(element => renderElement({
        ...element,
        x: element.x * zoom.x + offset.x,
        y: element.y * zoom.y + offset.y,
        width: element.width * zoom.x,
        height: element.height * zoom.y,
        selected: isSelected(element),
        moving: isChanged(element),
    }))

    const helpers: WithEditor = {
        grid,
        quantize,
        snapToGrid,
        changes,
        selection,
        bounds,
        zoom,
        offset,
        blocks,
        tool,
        mode,
        selectAll,
        deselectAll,
        moveSelection,
        duplicateSelection,
        deleteSelection,
        setZoom,
        resetZoom,
        multiplyZoom,
        setOffset,
        resetOffset,
        transposeOffset,
        setTool,
        setMode,
        onDown,
        onUp,
        onMove,
        isSelected,
        isChanged
    }

    /**
     * Keyboard bindings
     */
    useEffect(() => {

        if (!keys) return;

        Object.keys(keys).forEach(key => {

            const handler = keys[key];

            Array.isArray(handler)
                ? keyboardJS.bind(key, (e) => {
                    e?.preventDefault()
                    handler[0](helpers)
                }, (e) => {
                    e?.preventDefault()
                    handler[1](helpers)
                })
                : keyboardJS.bind(key, (e) => {
                    e?.preventDefault()
                    handler(helpers)
                })



        })

        return () => {
            Object.keys(keys).forEach(key => {
                keyboardJS.unbind(key)
            })
        }

    }, [keys, selection, zoom, offset])


    useEffect(() => {

        // Find the element we are pointing on
        const element = elements.find(element => isInBounds(element)({ ...pointerPosition, width: 0, height: 0 }))

        // Set the target
        element
            ? setTarget(Target.Element)
            : setTarget(Target.Grid)

        // Select the single element if it is not selected yet
        if (tool === Tool.Pointer && down && element && !isSelected(element)) {
            console.log("select pointer 1")
            mode === Mode.Special
                ? select([...selection, element.id])
                : select([element.id])
        }

        // Select again, if we already have a selection but did not move it.
        if (tool === Tool.Pointer && !down && element && !pointerOffset && mode === Mode.Special) {
            console.log("select pointer 2")

            select([...selection, element.id])
        }

        // Reset the selection if clicked outside and not moved
        if (target && tool === Tool.Pointer && !down && mode === Mode.Default && !element && !pointerOffset) {
            select([])
        }

        // CHange the selection to the new elements, if there are clones.
        if (!down && changes.some(change => change.type === Change.Add)) {
            select(changes.filter(isAddEvent).map(change => change.element.id))
        }

        // If there are changes, wait for the pointer to be up and propagate
        // the changes to the outside.
        if (!down && tool === Tool.Pointer && pointerOffset && changes.length) {
            flushChanges(changes)
        }




        // Create a new element
        if (down && tool === Tool.Pencil && !element && !pointerOffset) {
            console.log("creating an element")
            const id = generateId();
            const { x, y } = pointerPosition

            const width = grid.width / quantize.width;
            const height = grid.height / quantize.height;


            setId(id);

            // Directly flush the new selection, wait for resize changes to be flushed on pointer up.
            select([id])

            // Temporary store the new element, wait for a possible resize
            setChanges([
                {
                    type: Change.Add,
                    element: {
                        id,
                        x: snapToGrid ? floorTo(x, width) : x,
                        y: snapToGrid ? floorTo(y, height) : y,
                        width: width,
                        height: height
                    }
                }
            ])
        }

        // Resize an existing element
        if (down && tool === Tool.Pencil && element && !pointerOffset) {
            console.log("start resizing an existing element")

            const id = element.id;

            setId(id);

            // Directly flush the new selection, wait for resize changes to be flushed on pointer up.
            select([id])


            const width = Math.max(grid.width / quantize.width, pointerPosition.x - element.x)

            // Resize, but wait for the pointer up
            setChanges([
                {
                    type: Change.Update,
                    element: {
                        ...element,
                        width: snapToGrid ? snapTo(width, grid.width / quantize.width) : width,
                    }
                }
            ])

        }
        // Split an existing element
        if (down && tool === Tool.Scissor && element && !pointerOffset) {
            console.log("start splitting an existing element")

            const baseWidth = Math.max(grid.width / quantize.width, pointerPosition.x - element.x)
            const width = snapToGrid ? snapTo(baseWidth, grid.width / quantize.width) : baseWidth
            const elementCount = mode === Mode.Special
                ? Math.ceil(element.width / width) - 1
                : 1

            const newElements = Array.from(Array(elementCount).keys()).map<Add>((index) => ({

                type: Change.Add,
                element: {
                    ...element,
                    id: generateId(),
                    x: element.x + width * (index + 1),
                    width: element.width - (width * (index + 1))
                }
            }))

            const changes: ElementEvent[] = [
                {
                    type: Change.Update,
                    element: {
                        ...element,
                        width,
                    }
                },
                ...newElements
            ]

            flushChanges(changes)

            // Get the last element id, for selection
            const id = changes[changes.length - 1].element.id;

            select([id]);
        }


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [down, mode])


    /**
     * 2. When the target changes
     */
    useEffect(() => {

        if (!down && tool === Tool.Pointer && target === Target.Grid && pointerOffset) {

            const bounds = calculateBounds(pointerPosition, pointerOffset);

            const selected = bounds
                ? elements.filter(isInBounds(bounds)).map(element => element.id)
                : []

            console.log("select pointer x")

            mode === Mode.Special
                ? select([...selection, ...selected])
                : select(selected)

            // Reset the target, we want to verify a new click on the grid.
            // Otherwise hitting the shift key only will cause the select.
            setTarget(undefined)

        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, down, mode])

    /**
     * 2. Move the elements by setting elements changes
     */
    useEffect(() => {

        // Move the selection
        if (down && tool === Tool.Pointer && target === Target.Element && pointerOffset && selection.length) {

            const changes = elements
                .filter(element => selection.includes(element.id))
                .map<Add | Update>(element => {

                    const x = element.x + pointerOffset.x - pointerPosition.x;
                    const y = element.y + pointerOffset.y - pointerPosition.y;

                    const width = grid.width / quantize.width;
                    const height = grid.height / quantize.height;

                    return mode === Mode.Special
                        ? {
                            type: Change.Add,
                            element: {
                                ...element,
                                id: generateId(),
                                x: snapToGrid ? snapTo(x, width) : x,
                                y: snapToGrid ? snapTo(y, height) : y
                            }
                        }
                        : {
                            type: Change.Update,
                            element: {
                                ...element,
                                x: snapToGrid ? snapTo(x, width) : x,
                                y: snapToGrid ? snapTo(y, height) : y
                            }
                        }
                })

            // Temporary store the changes, so we don't always fire all movements
            setChanges(changes)

        }

        // Resize an element
        if (down && tool === Tool.Pencil && pointerOffset) {
            console.log("resizing element")


            const event = changes.filter(isElementEvent).find(change => change.element.id === id);

            if (!event) return;

            const width = Math.max(grid.width / quantize.width, pointerOffset.x - event.element.x)

            const { element } = event;

            // Temporary store the changes, so we don't always fire all movements
            setChanges([
                {
                    type: Change.Update,
                    element: {
                        ...element,
                        width: snapToGrid
                            ? snapTo(width, grid.width / quantize.width)
                            : width,
                    }
                }
            ])
        }

        // After creating the element and up the pointer, flush the changes.
        if (!down && tool === Tool.Pencil && changes.length) {
            console.log("resized element, flush changes and select the resized element")

            // Change the type to Add again.
            const resizeChanges = changes
                .filter(isElementEvent)
                .map<ElementEvent>(change => target === Target.Element
                    ? change
                    : ({ ...change, type: Change.Add }));

            flushChanges(resizeChanges);
        }

    }, [down, mode, pointerOffset, pointerPosition])


    return helpers
}