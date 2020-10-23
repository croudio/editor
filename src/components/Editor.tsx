import React, { FC, ReactElement, useReducer } from 'react'
import { Size, ChangeEvent, Element, Locator, Change } from '../typings'
import useEditor, { RenderElementProps, Settings, KeyHandler } from '../hooks/useEditor'
import EditorUI from '../ui/Editor'
import UIElement from '../ui/Element';
import { v4 as uuid } from 'uuid';
import Canvas from '../ui/Canvas';
import { ThemeProvider } from 'styled-components'
import defaultTheme from '../themes/default'

export enum Type {
    Add = "Add",
    Update = "Update",
    Remove = "Remove",
    Batch = "Batch",
}

const elementReducer = (state: Element[], action: any) => {

    switch (action.type) {

        case Type.Add:
            return [...state, action.element]

        case Type.Update:
            return state.map(element => element.id === action.element.id
                ? { ...element, ...action.element }
                : element
            )

        case Type.Remove:
            return state.filter(element => element.id !== action.id)

        // case Type.Batch:
        //     return action.changes.reduce<Element[]>(elementReducer, state);

        default:
            return state
    }
}


export interface Props extends Partial<Settings>, Partial<Size> {
    id?: string,
    elements?: Element[],
    locators?: Locator[],
    renderElement?: (props: RenderElementProps) => ReactElement
    onSelect?: (elements: Element[]) => void;
    onChange?: (events: ChangeEvent[]) => void;
    generateId?: () => string,
    keys?: Record<string, KeyHandler>
}

const Editor: FC<Props> = ({
    width,
    height,
    ...props
}) => {

    const [elements, dispatch] = useReducer(elementReducer, props.elements || []);

    const defaults = {
        id: "editor",
        locators: [],
        generateId: uuid,
        renderElement: (props: RenderElementProps) => <UIElement {...props} key={props.id} />,
        width: 400,
        height: 300,
        dimensions: { width: 400, height: 300 },
        grid: { width: 100, height: 100 },
        quantize: { width: 5, height: 5 },
        snapToGrid: true,
        onChange: (events: ChangeEvent[]) => {
            events.forEach(dispatch)
        },
        keys: {}
    }

    const merged = { ...defaults, ...props, elements };

    const withEditorProps = useEditor(merged);

    return <ThemeProvider theme={defaultTheme}>
        <Canvas width={merged.width} height={merged.height}>
            <EditorUI
                {...merged}
                {...withEditorProps}
            />
        </Canvas>

    </ThemeProvider>
}

export default Editor