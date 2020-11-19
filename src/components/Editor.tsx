import React, { FC, ReactElement, useReducer } from 'react'
import { ChangeEvent, Element, Locator, Plugin, Settings } from '../typings'
import useEditor, { RenderElementProps, KeyHandler } from '../hooks/useEditor'
import EditorUI from '../ui/Editor'
import UIElement from '../ui/Element';
import { v4 as uuid } from 'uuid';
import Canvas from '../ui/Canvas';
import { ThemeProvider } from 'styled-components'
import defaultTheme from '../themes/default'
// import elementReducer from '../reducers/elements'

export interface Props extends Partial<Settings> {
    id?: string,
    elements?: Element[],
    locators?: Locator[],
    renderElement?: (props: RenderElementProps) => ReactElement
    onSelect?: (elements: Element[]) => void;
    onChange?: (events: ChangeEvent[]) => void;
    generateId?: () => string,
    keys?: Record<string, KeyHandler>,
    plugins?: Plugin[]
}

const Editor: FC<Props> = (props) => {

    // Dispatch element updates on change.
    // const onChange = (events: ChangeEvent[]) => {

    //     console.log("hanleoNChange", events)
    //     // events.forEach(dispatch)

    //     props.onChange && props.onChange(events);
    // }

    // Merge the defaults with the props and local state
    const merged = {
        id: "editor",
        locators: [],
        generateId: uuid,
        renderElement: (props: RenderElementProps) => <UIElement {...props} key={props.id} />,
        size: { width: 400, height: 300 },
        grid: { width: 100, height: 100 },
        quantize: { width: 5, height: 5 },
        snapToGrid: true,
        keys: {},
        ...props,
    };

    // Build the editor props
    const editorProps = { ...merged, ...useEditor(merged) }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Canvas {...editorProps.size}>
                <EditorUI {...editorProps} />
            </Canvas>
        </ThemeProvider>
    )
}

export default Editor