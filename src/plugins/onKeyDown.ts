import { Plugin, Callback } from "../typings"
import keyboardJS from 'keyboardjs';


const onKeyDown = (key: string) => (callback: Callback): Plugin => (helpers) => {

    // console.log("test", key)
    // Register
    keyboardJS.bind(key, (e) => {

        // console.log("on key down", key)

        e?.preventDefault()

        callback(helpers)
    })

    // Unregister
    return () => {
        // console.log("unregister", key)
        keyboardJS.unbind(key);
    }

}

export default onKeyDown