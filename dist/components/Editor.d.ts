import { FC, ReactElement } from 'react';
import { ChangeEvent, Element, Locator, Plugin, Settings } from '../typings';
import { RenderElementProps, KeyHandler } from '../hooks/useEditor';
export interface Props extends Partial<Settings> {
    id?: string;
    elements?: Element[];
    locators?: Locator[];
    renderElement?: (props: RenderElementProps) => ReactElement;
    onSelect?: (elements: Element[]) => void;
    onChange?: (events: ChangeEvent[]) => void;
    generateId?: () => string;
    keys?: Record<string, KeyHandler>;
    plugins?: Plugin[];
}
declare const Editor: FC<Props>;
export default Editor;
