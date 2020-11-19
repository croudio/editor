import { Plugin, Callback } from "../typings"


const onPointingCanvas = (callback: Callback): Plugin => (helpers) => {

    const { pointerElement, down } = helpers;

    // Select the single element if it is not selected yet
    if (down && !pointerElement) {
        console.log("plugin: on pointing canvas")
        callback(helpers)
    }


}

export default onPointingCanvas