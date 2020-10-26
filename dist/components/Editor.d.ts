import { FC, ReactElement } from 'react';
import { Size, ChangeEvent, Element, Locator } from '../typings';
import { RenderElementProps, Settings, KeyHandler } from '../hooks/useEditor';
export interface Props extends Partial<Settings>, Partial<Size> {
    id?: string;
    elements?: Element[];
    locators?: Locator[];
    renderElement?: (props: RenderElementProps) => ReactElement;
    onSelect?: (elements: Element[]) => void;
    onChange?: (events: ChangeEvent[]) => void;
    generateId?: () => string;
    keys?: Record<string, KeyHandler>;
}
declare const Editor: FC<Props>;
export default Editor;
