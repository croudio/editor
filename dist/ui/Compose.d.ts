import { FC } from 'react';
import { Size } from '../typings';
export declare enum Align {
    Left = "left",
    Top = "top",
    Right = "right",
    Bottom = "bottom"
}
export interface Tree {
    first?: string | Tree;
    second?: string | Tree;
    align: Align;
    split: number;
}
export interface Component {
    id: string;
    render: FC<Size>;
}
export interface Props extends Size {
    tree: Tree;
    components: Component[];
}
declare const Compose: FC<Props>;
export default Compose;
