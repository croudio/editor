import { Plugin, Callback } from "../typings";
declare const onKeyDown: (key: string) => (callback: Callback) => Plugin;
export default onKeyDown;
