import React, { FC, ReactElement, useReducer } from 'react'
import { Size, ChangeEvent, Element, Locator, Change } from '../typings'
import useEditor, { RenderElementProps, Settings, KeyHandler } from '../hooks/useEditor'
import EditorUI from '../ui/Editor'
import UIElement from '../ui/Element';
import { v4 as uuid } from 'uuid';
import Canvas from '../ui/Canvas';
import { ThemeProvider } from 'styled-components'
import defaultTheme from '../themes/default'
import elementReducer from '../reducers/elements'

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

const Editor: FC<Props> = (props) => {

    const [elements, dispatch] = useReducer(elementReducer, props.elements || []);

    const defaults = {
        id: "editor",
        locators: [],
        generateId: uuid,
        renderElement: (props: RenderElementProps) => <UIElement {...props} key={props.id} />,
        size: { width: 400, height: 300 },
        grid: { width: 100, height: 100 },
        quantize: { width: 5, height: 5 },
        snapToGrid: true,
        onChange: (events: ChangeEvent[]) => {
            events.forEach(dispatch)
        },
        keys: {}
    }

    // Merge the defaults with the props and local state
    const merged = { ...defaults, ...props, elements };

    const editorProps = useEditor(merged);

    return (
        <ThemeProvider theme={defaultTheme}>
            <Canvas {...merged.size}>
                <EditorUI {...merged} {...editorProps} />
            </Canvas>
        </ThemeProvider>
    )
}

export default Editor