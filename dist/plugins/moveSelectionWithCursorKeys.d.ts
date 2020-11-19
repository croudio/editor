import { Plugin } from "../typings";
interface Options {
    special?: string;
}
declare const moveSelectionWithCursorKeys: (options?: Options | undefined) => Plugin;
export default moveSelectionWithCursorKeys;
