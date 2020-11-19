import { Plugin, Callback } from "../typings";
declare const onKeyUp: (key: string) => (callback: Callback) => Plugin;
export default onKeyUp;
