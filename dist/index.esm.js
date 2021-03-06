import React, { useReducer, useState, useEffect, memo, useCallback } from 'react';
import uniqBy from 'lodash/fp/uniqBy';
import compose from 'lodash/fp/compose';
import sortBy from 'lodash/fp/sortBy';
import { v4 } from 'uuid';
import styled, { ThemeProvider } from 'styled-components';
import { themeGet } from '@styled-system/theme-get';
import Color from 'color';
import keyboardJS from 'keyboardjs';

var Tool;
(function (Tool) {
    Tool["Pointer"] = "pointer";
    Tool["Pencil"] = "pencil";
    Tool["Lasso"] = "lasso";
    Tool["Eraser"] = "eraser";
    Tool["Scissor"] = "scissor";
})(Tool || (Tool = {}));
var Mode;
(function (Mode) {
    Mode["Default"] = "default";
    Mode["Special"] = "special";
})(Mode || (Mode = {}));
var Change;
(function (Change) {
    Change["Set"] = "Set";
    Change["Add"] = "Add";
    Change["Update"] = "Update";
    Change["Remove"] = "Remove";
    Change["Select"] = "Select";
    Change["KeyUp"] = "KeyUp";
    Change["KeyDown"] = "KeyDown";
})(Change || (Change = {}));
var Target;
(function (Target) {
    Target["Grid"] = "Grid";
    Target["Element"] = "Element";
})(Target || (Target = {}));
const isSetEvent = (change) => change.type === Change.Set;
const isAddEvent = (change) => change.type === Change.Add;
const isUpdateEvent = (change) => change.type === Change.Update;
const isRemoveEvent = (change) => change.type === Change.Remove;
const isElementEvent = (change) => [Change.Add, Change.Update, Change.Remove].includes(change.type);
const isEditorEvent = (change) => [Change.Select].includes(change.type);

const calculateBounds = (position, offset) => ({
    x: offset.x > position.x ? position.x : offset.x,
    y: offset.y > position.y ? position.y : offset.y,
    width: offset.x > position.x ? offset.x - position.x : position.x - offset.x,
    height: offset.y > position.y ? offset.y - position.y : position.y - offset.y
});
const getUpperBounds = (bounds) => {
    const x = Math.min(...bounds.map(bound => bound.x));
    const y = Math.min(...bounds.map(bound => bound.y));
    const width = Math.max(...bounds.map(bound => bound.x + bound.width));
    const height = Math.max(...bounds.map(bound => bound.y + bound.height));
    return { x, y, width, height };
};
const isInBounds = (bounds) => (subject) => {
    return ((subject.x > bounds.x && subject.x < bounds.x + bounds.width)
        ||
            (subject.x + subject.width > bounds.x && subject.x + subject.width < bounds.x + bounds.width))
        &&
            ((subject.y > bounds.y && subject.y < bounds.y + bounds.height)
                ||
                    (subject.y + subject.height > bounds.y && subject.y + subject.height < bounds.y + bounds.height));
};

const snapTo = (value, snap) => Math.round(value / snap) * snap;
const floorTo = (value, snap) => Math.floor(value / snap) * snap;

var elementReducer = (state, action) => {
    switch (action.type) {
        case Change.Set:
            return action.elements;
        case Change.Add:
            return [...state, action.element];
        case Change.Update:
            return state.map(element => element.id === action.element.id
                ? Object.assign(Object.assign({}, element), action.element) : element);
        case Change.Remove:
            return state.filter(element => element.id !== action.element.id);
        // case Change.Batch:
        //     return action.changes.reduce<Element[]>(elementReducer, state);
        default:
            return state;
    }
};

var useEditor = ({ elements: defaultElements, renderElement, size, grid, quantize, snapToGrid, onChange, generateId: customGenerateId, keys, plugins }) => {
    const generateId = customGenerateId || v4;
    // Elements
    const [elements, dispatch] = useReducer(elementReducer, []);
    const [selection, select] = useState([]);
    const [zoom, setZoom] = useState({ x: 1, y: 1 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [tool, setTool] = useState(Tool.Pointer);
    const [mode, setMode] = useState(Mode.Default);
    // Track pointer movement
    const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });
    const [pointerOffset, setPointerOffset] = useState();
    // Track pointer selection
    const [down, setDown] = useState(false);
    const [target, setTarget] = useState();
    // Keep track of local changes, that do not directly bubble to the outside.
    const [changes, setChanges] = useState([]);
    // Used as temporary id for creating and updating elements
    const [id, setId] = useState(generateId ? generateId() : v4);
    useEffect(() => {
        console.log("change in useEffect", defaultElements);
        dispatch({ type: Change.Set, elements: defaultElements });
    }, [JSON.stringify(defaultElements)]);
    // Dispatch element updates on change.
    const flushChanges = (events) => {
        events.forEach(dispatch);
        onChange && onChange(events);
    };
    /**
     * Helpers
     */
    const isSelected = (element) => selection.includes(element.id);
    const isChanged = (element) => changes
        .filter(isElementEvent)
        .some(change => change.element.id === element.id);
    // const selectAll = () => select(elements.map(element => element.id))
    const deselectAll = () => select([]);
    // const moveSelection = (transition: Position) => {
    //     const changes = elements
    //         .filter(element => selection.includes(element.id))
    //         .map<Update>(element => ({
    //             type: Change.Update,
    //             element: {
    //                 ...element,
    //                 x: element.x + transition.x,
    //                 y: element.y + transition.y
    //             }
    //         }))
    //     onChange && onChange(changes)
    // }
    // const duplicateSelection = () => {
    //     const selected = elements
    //         .filter(element => selection.includes(element.id));
    //     const bounds = getUpperBounds(selected)
    //     const changes = selected.map<Add>(element => ({
    //         type: Change.Add,
    //         element: {
    //             ...element,
    //             id: generateId(),
    //             x: element.x + bounds.width - bounds.x,
    //         }
    //     }))
    //     onChange && onChange(changes);
    //     select(changes.map(change => change.element.id))
    // }
    // const deleteSelection = () => {
    //     const changes = elements
    //         .filter(element => selection.includes(element.id))
    //         .map<Remove>(element => ({ type: Change.Remove, element }))
    //     onChange && onChange(changes)
    // }
    const resetZoom = () => {
        setZoom({ x: 1, y: 1 });
    };
    const multiplyZoom = (transition) => {
        setZoom({
            x: zoom.x * transition.x,
            y: zoom.y * transition.y,
        });
    };
    const transposeOffset = (transition) => {
        setOffset({
            x: offset.x + transition.x,
            y: offset.y + transition.y,
        });
    };
    const resetOffset = () => {
        setOffset({ x: 0, y: 0 });
    };
    const onMove = (position) => {
        setPointerOffset(position);
    };
    const onDown = (position) => {
        setDown(true);
        setPointerPosition(position);
        setPointerOffset(undefined);
    };
    const onUp = (position) => {
        setDown(false);
    };
    // const flushChanges = (changes: ChangeEvent[]) => {
    //     // onChange && changes.length && onChange(changes)
    //     handleChange(changes)
    //     setChanges([]);
    // }
    const bounds = target === Target.Grid && tool === Tool.Pointer && down && pointerOffset
        ? calculateBounds(pointerPosition, pointerOffset)
        : undefined;
    // Merge the original elements with the local changes.
    const elementsWithChanges = compose(uniqBy("id"), sortBy(isSelected))([
        ...changes
            .filter(isElementEvent)
            .map(change => change.element),
        ...elements
    ]);
    const blocks = elementsWithChanges.map(element => renderElement(Object.assign(Object.assign({}, element), { x: element.x * zoom.x + offset.x, y: element.y * zoom.y + offset.y, width: element.width * zoom.x, height: element.height * zoom.y, selected: isSelected(element), moving: isChanged(element) })));
    const helpers = {
        size,
        grid,
        quantize,
        snapToGrid,
        changes,
        elements,
        generateId,
        select,
        onChange: flushChanges,
        selection,
        bounds,
        zoom,
        offset,
        blocks,
        tool,
        mode,
        target,
        pointerOffset,
        pointerPosition,
        down,
        setChanges,
        // selectAll,
        deselectAll,
        // moveSelection,
        // duplicateSelection,
        // deleteSelection,
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
    };
    const handlePlugin = (pointerElement) => (plugin) => plugin(Object.assign(Object.assign({}, helpers), { pointerElement }));
    /**
     *
     * Handle plugins
     *
     */
    useEffect(() => {
        if (!plugins)
            return;
        // Find the element we are pointing on
        const element = elements.find(element => isInBounds(element)(Object.assign(Object.assign({}, pointerPosition), { width: 0, height: 0 })));
        // Set the target
        element
            ? setTarget(Target.Element)
            : setTarget(Target.Grid);
        const unregisters = plugins.map(handlePlugin(element));
        // Unregister plugins
        return () => {
            unregisters.forEach((fn) => fn instanceof Function ? fn() : undefined);
        };
    }, [plugins, down, mode,
        JSON.stringify(elements),
        JSON.stringify(selection),
    ]);
    useEffect(() => {
        // Find the element we are pointing on
        const element = elements.find(element => isInBounds(element)(Object.assign(Object.assign({}, pointerPosition), { width: 0, height: 0 })));
        // Set the target
        element
            ? setTarget(Target.Element)
            : setTarget(Target.Grid);
        // Select the single element if it is not selected yet
        // if (tool === Tool.Pointer && down && element && !isSelected(element)) {
        //     console.log("select pointer 1")
        //     mode === Mode.Special
        //         ? select([...selection, element.id])
        //         : select([element.id])
        // }
        // Select again, if we already have a selection but did not move it.
        // if (tool === Tool.Pointer && !down && element && !pointerOffset && mode === Mode.Special) {
        //     console.log("select pointer 2")
        //     select([...selection, element.id])
        // }
        // Reset the selection if clicked outside and not moved
        // if (target && tool === Tool.Pointer && !down && mode === Mode.Default && !element && !pointerOffset) {
        //     select([])
        // }
        // CHange the selection to the new elements, if there are clones.
        if (!down && changes.some(change => change.type === Change.Add)) {
            select(changes.filter(isAddEvent).map(change => change.element.id));
        }
        // If there are changes, wait for the pointer to be up and propagate
        // the changes to the outside.
        if (!down && tool === Tool.Pointer && pointerOffset && changes.length) {
            flushChanges(changes);
        }
        // Create a new element
        if (down && tool === Tool.Pencil && !element && !pointerOffset) {
            console.log("creating an element");
            const id = generateId();
            const { x, y } = pointerPosition;
            const width = grid.width / quantize.width;
            const height = grid.height / quantize.height;
            setId(id);
            // Directly flush the new selection, wait for resize changes to be flushed on pointer up.
            select([id]);
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
            ]);
        }
        // Resize an existing element
        if (down && tool === Tool.Pencil && element && !pointerOffset) {
            console.log("start resizing an existing element");
            const id = element.id;
            setId(id);
            // Directly flush the new selection, wait for resize changes to be flushed on pointer up.
            select([id]);
            const width = Math.max(grid.width / quantize.width, pointerPosition.x - element.x);
            // Resize, but wait for the pointer up
            setChanges([
                {
                    type: Change.Update,
                    element: Object.assign(Object.assign({}, element), { width: snapToGrid ? snapTo(width, grid.width / quantize.width) : width })
                }
            ]);
        }
        // Split an existing element
        if (down && tool === Tool.Scissor && element && !pointerOffset) {
            console.log("start splitting an existing element");
            const baseWidth = Math.max(grid.width / quantize.width, pointerPosition.x - element.x);
            const width = snapToGrid ? snapTo(baseWidth, grid.width / quantize.width) : baseWidth;
            const elementCount = mode === Mode.Special
                ? Math.ceil(element.width / width) - 1
                : 1;
            const newElements = Array.from(Array(elementCount).keys()).map((index) => ({
                type: Change.Add,
                element: Object.assign(Object.assign({}, element), { id: generateId(), x: element.x + width * (index + 1), width: element.width - (width * (index + 1)) })
            }));
            const changes = [
                {
                    type: Change.Update,
                    element: Object.assign(Object.assign({}, element), { width })
                },
                ...newElements
            ];
            flushChanges(changes);
            // Get the last element id, for selection
            const id = changes[changes.length - 1].element.id;
            select([id]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [down, mode]);
    /**
     * 2. When the target changes
     */
    // useEffect(() => {
    //     if (!down && tool === Tool.Pointer && target === Target.Grid && pointerOffset) {
    //         const bounds = calculateBounds(pointerPosition, pointerOffset);
    //         const selected = bounds
    //             ? elements.filter(isInBounds(bounds)).map(element => element.id)
    //             : []
    //         console.log("select pointer x")
    //         mode === Mode.Special
    //             ? select([...selection, ...selected])
    //             : select(selected)
    //         // Reset the target, we want to verify a new click on the grid.
    //         // Otherwise hitting the shift key only will cause the select.
    //         setTarget(undefined)
    //     };
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [target, down, mode])
    /**
     * 2. Move the elements by setting elements changes
     */
    useEffect(() => {
        // Move the selection
        if (down && tool === Tool.Pointer && target === Target.Element && pointerOffset && selection.length) {
            const changes = elements
                .filter(element => selection.includes(element.id))
                .map(element => {
                const x = element.x + pointerOffset.x - pointerPosition.x;
                const y = element.y + pointerOffset.y - pointerPosition.y;
                const width = grid.width / quantize.width;
                const height = grid.height / quantize.height;
                return mode === Mode.Special
                    ? {
                        type: Change.Add,
                        element: Object.assign(Object.assign({}, element), { id: generateId(), x: snapToGrid ? snapTo(x, width) : x, y: snapToGrid ? snapTo(y, height) : y })
                    }
                    : {
                        type: Change.Update,
                        element: Object.assign(Object.assign({}, element), { x: snapToGrid ? snapTo(x, width) : x, y: snapToGrid ? snapTo(y, height) : y })
                    };
            });
            // Temporary store the changes, so we don't always fire all movements
            setChanges(changes);
        }
        // Resize an element
        if (down && tool === Tool.Pencil && pointerOffset) {
            console.log("resizing element");
            const event = changes.filter(isElementEvent).find(change => change.element.id === id);
            if (!event)
                return;
            const width = Math.max(grid.width / quantize.width, pointerOffset.x - event.element.x);
            const { element } = event;
            // Temporary store the changes, so we don't always fire all movements
            setChanges([
                {
                    type: Change.Update,
                    element: Object.assign(Object.assign({}, element), { width: snapToGrid
                            ? snapTo(width, grid.width / quantize.width)
                            : width })
                }
            ]);
        }
        // After creating the element and up the pointer, flush the changes.
        if (!down && tool === Tool.Pencil && changes.length) {
            console.log("resized element, flush changes and select the resized element");
            // Change the type to Add again.
            const resizeChanges = changes
                .filter(isElementEvent)
                .map(change => target === Target.Element
                ? change
                : (Object.assign(Object.assign({}, change), { type: Change.Add })));
            flushChanges(resizeChanges);
        }
    }, [down, mode, pointerOffset, pointerPosition]);
    return helpers;
};

const Grid = ({ id, x = 0, y = 0, width, height, color, grid, offset }) => {
    return (React.createElement(React.Fragment, null,
        React.createElement("defs", null,
            React.createElement("pattern", { id: id, x: -offset.x, y: -offset.y, width: grid.width, height: grid.height, patternUnits: "userSpaceOnUse" },
                React.createElement("path", { d: `M ${grid.width} 0 L 0 0 0 ${grid.height}`, fill: "none", stroke: color, strokeWidth: "0.5" }))),
        React.createElement("g", { transform: `translate(${x},${y})` },
            React.createElement("rect", { id: "grid", width: width, height: height, fill: `url(#${id})` }))));
};
// export default Grid
var Grid$1 = memo(Grid, (prev, next) => {
    return prev.id === next.id &&
        prev.color === next.color &&
        prev.x === next.x &&
        prev.y === next.y &&
        prev.offset.x === next.offset.x &&
        prev.offset.y === next.offset.y &&
        prev.width === next.width &&
        prev.height === next.height &&
        prev.grid.width === next.grid.width &&
        prev.grid.height === next.grid.height;
});

const StyledSelection = styled.rect `
    ${themeGet('selection.default')}
    stroke-dasharray: 5,5;
`;
const Selection = (props) => {
    return React.createElement(StyledSelection, Object.assign({ pointerEvents: "none" }, props));
};
var Selection$1 = memo(Selection, (prev, next) => {
    return prev.x === next.x &&
        prev.y === next.y &&
        prev.width === next.width &&
        prev.height === next.height;
});

const getCursor = (tool) => {
    switch (tool) {
        case Tool.Pointer:
            return "move";
        case Tool.Pencil:
            return "e-resize";
        case Tool.Scissor:
            return "col-resize";
        default:
            return "pointer";
    }
};
const Overlay = ({ x = 0, y = 0, width, height, tool, onDown, onUp, onMove, onEnter, onLeave }) => {
    const handleDown = useCallback((e) => {
        e.preventDefault();
        if (e.target !== e.currentTarget)
            return;
        const box = e.currentTarget.getBoundingClientRect();
        const test = {
            x: e.clientX - box.left + x,
            y: e.clientY - box.top + y
        };
        onDown && onDown(test);
    }, [onDown, x, y]);
    const handleUp = useCallback((e) => {
        e.preventDefault();
        if (e.target !== e.currentTarget)
            return;
        const box = e.currentTarget.getBoundingClientRect();
        const position = {
            x: e.clientX - box.left,
            y: e.clientY - box.top
        };
        onUp && onUp(position);
    }, [onUp]);
    const handleMove = (e) => {
        e.preventDefault();
        if (!onMove)
            return;
        const box = e.currentTarget.getBoundingClientRect();
        onMove({
            x: e.clientX - box.left,
            y: e.clientY - box.top
        });
    };
    const handleEnter = useCallback((e) => {
        e.preventDefault();
        if (e.target !== e.currentTarget)
            return;
        const box = e.currentTarget.getBoundingClientRect();
        const test = {
            x: e.clientX - box.left + x,
            y: e.clientY - box.top + y
        };
        onEnter && onEnter(test);
    }, [onEnter, x, y]);
    const handleLeave = useCallback((e) => {
        e.preventDefault();
        if (e.target !== e.currentTarget)
            return;
        const box = e.currentTarget.getBoundingClientRect();
        const test = {
            x: e.clientX - box.left + x,
            y: e.clientY - box.top + y
        };
        onLeave && onLeave(test);
    }, [onLeave, x, y]);
    return (React.createElement("rect", { width: width, height: height, fill: "none", pointerEvents: "all", style: {
            cursor: getCursor(tool)
        }, onPointerDown: handleDown, onPointerUp: handleUp, onPointerMove: handleMove, onPointerEnter: handleEnter, onPointerLeave: handleLeave }));
};
// export default Overley
var Overlay$1 = memo(Overlay, (prev, next) => {
    return prev.x === next.x &&
        prev.y === next.y &&
        prev.width === next.width &&
        prev.height === next.height &&
        prev.tool === next.tool;
});

const Line = styled.line `
    ${themeGet('locator.default')}
    ${props => props.active && themeGet('locator.active')(props)}
`;
const Locator = ({ x, active }) => {
    return React.createElement(Line, { x1: x, x2: x, y1: 0, y2: "100%", active: active });
};

const Editor = ({ id, size, grid, quantize, zoom, offset, locators, blocks, bounds, tool, onDown, onUp, onMove }) => {
    return (React.createElement("g", null,
        React.createElement(Grid$1, Object.assign({}, size, { id: `${id}-small`, color: "lightGrey", grid: {
                width: zoom.x * grid.width / quantize.width,
                height: zoom.y * grid.height / quantize.height
            }, offset: offset })),
        React.createElement(Grid$1, Object.assign({}, size, { id: `${id}-large`, color: "grey", grid: {
                width: zoom.x * grid.width,
                height: zoom.y * grid.height
            }, offset: offset })),
        locators.map(locator => (React.createElement(Locator, { key: locator.id, x: locator.time * grid.width / quantize.width, active: locator.id !== "time" }))),
        blocks,
        bounds && React.createElement(Selection$1, Object.assign({}, bounds)),
        React.createElement(Overlay$1, Object.assign({}, size, { tool: tool, onDown: onDown, onUp: onUp, onMove: onMove }))));
};

const StyledElement = styled.rect `
    ${themeGet('element.default')}
    ${props => props.active && themeGet('element.active')(props)}
    ${props => props.selected && themeGet('element.selected')(props)}
    ${props => props.moving && themeGet('element.moving')(props)}
    cursor: pointer;
`;
const Element = ({ id, x, y, width, height, selected, moving, active }) => {
    return (React.createElement("g", { transform: `translate(${x},${y})` },
        React.createElement(StyledElement, { width: width, height: height, selected: !!selected, moving: !!moving, active: !!active }),
        React.createElement("rect", { x: width - 5, width: 5, height: height, style: { fill: "none" } })));
};
// export default Element
var UIElement = memo(Element, (prev, next) => {
    return prev.id === next.id &&
        prev.width === next.width &&
        prev.height === next.height &&
        prev.x === next.x &&
        prev.y === next.y &&
        prev.selected === next.selected &&
        prev.moving === next.moving &&
        prev.active === next.active;
});

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

const Canvas = (_a) => {
    var { width, height, onMove } = _a, rest = __rest(_a, ["width", "height", "onMove"]);
    const [isDown, setDown] = useState(false);
    const handleMove = (e) => {
        e.preventDefault();
        if (!isDown || !onMove)
            return;
        const box = e.currentTarget.getBoundingClientRect();
        onMove({
            x: e.clientX - box.left,
            y: e.clientY - box.top
        });
    };
    const handleDown = (e) => {
        setDown(true);
    };
    const handleUp = (e) => {
        setDown(false);
    };
    return (React.createElement("svg", Object.assign({ viewBox: `0 0 ${width} ${height}`, width: width, height: height, onPointerDown: handleDown, onPointerMove: handleMove, onPointerUp: handleUp, onPointerLeave: handleUp }, rest)));
};

const palette = {
    canvas: "ghostwhite",
    base: "slategrey",
    // active: "dodgerblue",
    // active: "cornflowerblue",
    active: "skyblue",
    primary: "yellowgreen"
};
const colors = {
    canvas: {
        soft2: Color(palette.canvas).lighten(.6).hex(),
        soft1: Color(palette.canvas).lighten(.2).hex(),
        default: palette.canvas,
        hard1: Color(palette.canvas).darken(.2).hex(),
        hard2: Color(palette.canvas).darken(.6).hex(),
    },
    base: {
        soft2: Color(palette.base).lighten(.6).hex(),
        soft1: Color(palette.base).lighten(.2).hex(),
        default: palette.base,
        hard1: Color(palette.base).darken(.2).hex(),
        hard2: Color(palette.base).darken(.6).hex(),
    },
    active: {
        soft2: Color(palette.active).lighten(.6).hex(),
        soft1: Color(palette.active).lighten(.2).hex(),
        default: palette.active,
        hard1: Color(palette.active).darken(.2).hex(),
        hard2: Color(palette.active).darken(.6).hex()
    },
    primary: {
        soft2: Color(palette.primary).lighten(.4).hex(),
        soft1: Color(palette.primary).lighten(.2).hex(),
        default: palette.primary,
        hard1: Color(palette.primary).darken(.2).hex(),
        hard2: Color(palette.primary).darken(.4).hex()
    },
};
var defaultTheme = {
    element: {
        default: {
            fill: colors.base.default,
            stroke: colors.base.hard1,
            cursor: "move",
        },
        selected: {
            fill: colors.primary.default,
            stroke: colors.primary.hard1,
        },
        moving: {
            fill: colors.primary.soft2,
            stroke: colors.primary.soft1,
        },
        active: {
            fill: colors.active.default,
            stroke: colors.active.hard1,
        },
    },
    selection: {
        default: {
            stroke: colors.primary.default,
            fill: Color(colors.primary.default).alpha(0.2).toString()
        },
    },
    button: {
        default: {
            container: {
                fill: colors.base.default,
                stroke: colors.base.hard1,
            }
        },
        active: {
            container: {
                fill: colors.primary.default,
                stroke: colors.primary.hard1,
            }
        },
    },
    tools: {
        default: {
            fill: colors.base.soft2,
        }
    },
    key: {
        default: {
            fill: "white",
            stroke: colors.base.hard1,
            cursor: "pointer",
        },
        off: {
            fill: "black",
            stroke: colors.primary.hard1,
        },
        active: {
            fill: colors.active.default,
            stroke: colors.active.hard1,
        },
    },
    locator: {
        default: {
            stroke: colors.base.hard1,
        },
        active: {
            stroke: colors.active.default,
        },
    },
    timeline: {
        container: {
            default: {
                fill: "red",
                stroke: colors.base.hard1,
                cursor: "pointer",
            },
        }
    },
};

const Editor$1 = (props) => {
    // Dispatch element updates on change.
    // const onChange = (events: ChangeEvent[]) => {
    //     console.log("hanleoNChange", events)
    //     // events.forEach(dispatch)
    //     props.onChange && props.onChange(events);
    // }
    // Merge the defaults with the props and local state
    const merged = Object.assign({ id: "editor", locators: [], generateId: v4, renderElement: (props) => React.createElement(UIElement, Object.assign({}, props, { key: props.id })), size: { width: 400, height: 300 }, grid: { width: 100, height: 100 }, quantize: { width: 5, height: 5 }, snapToGrid: true, keys: {} }, props);
    // Build the editor props
    const editorProps = Object.assign(Object.assign({}, merged), useEditor(merged));
    return (React.createElement(ThemeProvider, { theme: defaultTheme },
        React.createElement(Canvas, Object.assign({}, editorProps.size),
            React.createElement(Editor, Object.assign({}, editorProps)))));
};

const DuplicateSelection = ({ elements, selection, generateId, select, onChange }) => {
    console.log("helper: duplicate");
    const selected = elements
        .filter(element => selection.includes(element.id));
    const bounds = getUpperBounds(selected);
    const changes = selected.map(element => ({
        type: Change.Add,
        element: Object.assign(Object.assign({}, element), { id: generateId(), x: element.x + bounds.width - bounds.x })
    }));
    onChange && onChange(changes);
    select(changes.map(change => change.element.id));
};

const moveSelection = (transition) => ({ elements, selection, onChange }) => {
    console.log("helper: moveSelection");
    const changes = elements
        .filter(element => selection.includes(element.id))
        .map(element => ({
        type: Change.Update,
        element: Object.assign(Object.assign({}, element), { x: element.x + transition.x, y: element.y + transition.y })
    }));
    onChange && onChange(changes);
};

const deleteSelection = ({ elements, selection, onChange }) => {
    const changes = elements
        .filter(element => selection.includes(element.id))
        .map(element => ({ type: Change.Remove, element }));
    console.log("helper: delete selection", { elements, selection, changes, onChange });
    onChange && onChange(changes);
};

const clearSelection = ({ selection, select }) => {
    if (selection.length) {
        console.log("helper: clear selection", { selection });
        select([]);
    }
};

const updateMode = (mode) => ({ setMode }) => {
    console.log("helper: setMode", mode);
    setMode(mode);
};

const selectAll = ({ elements, select }) => {
    console.log("helper: selectAll");
    select(elements.map(element => element.id));
};

const selectElement = ({ mode, down, pointerElement, selection, isSelected, select }) => {
    // Select the single element if it is not selected yet
    if (down && pointerElement && !isSelected(pointerElement)) {
        console.log("plugin: select element");
        mode === Mode.Special
            ? select([...selection, pointerElement.id])
            : select([pointerElement.id]);
    }
};

const onPointingCanvas = (callback) => (helpers) => {
    const { pointerElement, down } = helpers;
    // Select the single element if it is not selected yet
    if (down && !pointerElement) {
        console.log("plugin: on pointing canvas");
        callback(helpers);
    }
};

const selectElement$1 = ({ tool, mode, grid, quantize, snapToGrid, changes, setChanges, generateId, down, elements, selection, pointerElement, pointerOffset, pointerPosition }) => {
    // Move the selection
    if (down && tool === Tool.Pointer && pointerElement && pointerOffset && pointerPosition && selection.length) {
        const changes = elements
            .filter(element => selection.includes(element.id))
            .map(element => {
            const x = element.x + pointerOffset.x - pointerPosition.x;
            const y = element.y + pointerOffset.y - pointerPosition.y;
            const width = grid.width / quantize.width;
            const height = grid.height / quantize.height;
            return mode === Mode.Special
                ? {
                    type: Change.Add,
                    element: Object.assign(Object.assign({}, element), { id: generateId(), x: snapToGrid ? snapTo(x, width) : x, y: snapToGrid ? snapTo(y, height) : y })
                }
                : {
                    type: Change.Update,
                    element: Object.assign(Object.assign({}, element), { x: snapToGrid ? snapTo(x, width) : x, y: snapToGrid ? snapTo(y, height) : y })
                };
        });
        // Temporary store the changes, so we don't always fire all movements
        setChanges(changes);
    }
    // Unregister
    return () => {
        if (!down && changes.length) {
            console.log("setChanges([])");
            setChanges([]);
        }
    };
};

const onKeyDown = (key) => (callback) => (helpers) => {
    // console.log("test", key)
    // Register
    keyboardJS.bind(key, (e) => {
        // console.log("on key down", key)
        e === null || e === void 0 ? void 0 : e.preventDefault();
        callback(helpers);
    });
    // Unregister
    return () => {
        // console.log("unregister", key)
        keyboardJS.unbind(key);
    };
};

const onKeyUp = (key) => (callback) => (helpers) => {
    // console.log("test", key)
    // Register
    keyboardJS.bind(key, null, (e) => {
        // console.log("on key up", key)
        e === null || e === void 0 ? void 0 : e.preventDefault();
        callback(helpers);
    });
    // Unregister
    return () => {
        // console.log("unregister", key)
        keyboardJS.unbind(key);
    };
};

const moveSelectionWithCursorKeys = (options) => (helpers) => {
    // Extract the options
    const { special = "shift" } = options || {};
    // Need info about the grid to calculate the transpose values. 
    const { grid, quantize } = helpers;
    // Compose multiple plugins
    const items = [
        onKeyDown("left")(moveSelection({ x: -grid.width / quantize.width, y: 0 })),
        onKeyDown("right")(moveSelection({ x: grid.width / quantize.width, y: 0 })),
        onKeyDown("up")(moveSelection({ x: 0, y: -grid.height / quantize.height })),
        onKeyDown("down")(moveSelection({ x: 0, y: grid.height / quantize.height })),
        onKeyDown(`${special}+left`)(moveSelection({ x: -grid.width, y: 0 })),
        onKeyDown(`${special}+right`)(moveSelection({ x: grid.width, y: 0 })),
        onKeyDown(`${special}+up`)(moveSelection({ x: 0, y: -grid.height })),
        onKeyDown(`${special}+down`)(moveSelection({ x: 0, y: grid.height })),
    ];
    // Call the plugins and collect its unregister callbacks
    const unregisters = items.map(item => item(helpers));
    // Unregister
    return () => {
        unregisters.forEach(unregister => unregister instanceof Function ? unregister() : undefined);
    };
};

export { Change, Editor$1 as Editor, Mode, Target, Tool, clearSelection, deleteSelection, selectElement$1 as dragSelection, DuplicateSelection as duplicateSelection, isAddEvent, isEditorEvent, isElementEvent, isRemoveEvent, isSetEvent, isUpdateEvent, moveSelection, moveSelectionWithCursorKeys, onKeyDown, onKeyUp, onPointingCanvas, selectAll, selectElement, updateMode as setMode };
//# sourceMappingURL=index.esm.js.map
