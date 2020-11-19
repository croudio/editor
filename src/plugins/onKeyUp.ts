import { Plugin, Callback } from "../typings"
import keyboardJS from 'keyboardjs';


const onKeyUp = (key: string) => (callback: Callback): Plugin => (helpers) => {

    // console.log("test", key)
    // Register
    keyboardJS.bind(key, null, (e) => {

        // console.log("on key up", key)

        e?.preventDefault()

        callback(helpers)
    })

    // Unregister
    return () => {
        // console.log("unregister", key)
        keyboardJS.unbind(key);
    }

}

export default onKeyUp