


import { moveSelection } from "../helpers/index"
import { Plugin } from "../typings"
import onKeyDown from "./onKeyDown"


interface Options {
    special?: string
}


const moveSelectionWithCursorKeys = (options?: Options): Plugin => (helpers) => {

    // Extract the options
    const { special = "shift" } = options || {};

    // Need info about the grid to calculate the transpose values. 
    const { grid, quantize } = helpers;

    // Compose multiple plugins
    const items = [
        onKeyDown("left")(moveSelection({ x: -grid.width / quantize.width, y: 0 })),
        onKeyDown("right")(moveSelection({ x: grid.width / quantize.width, y: 0 })),
        onKeyDown("up")(moveSelection({ x: 0, y: -grid.height / quantize.height })),
        onKeyDown("down")(moveSelection({ x: 0, y: grid.height / quantize.height })),
        onKeyDown(`${special}+left`)(moveSelection({ x: -grid.width, y: 0 })),
        onKeyDown(`${special}+right`)(moveSelection({ x: grid.width, y: 0 })),
        onKeyDown(`${special}+up`)(moveSelection({ x: 0, y: -grid.height })),
        onKeyDown(`${special}+down`)(moveSelection({ x: 0, y: grid.height })),
    ]

    // Call the plugins and collect its unregister callbacks
    const unregisters = items.map(item => item(helpers))

    // Unregister
    return () => {
        unregisters.forEach(unregister => unregister instanceof Function ? unregister() : undefined);
    }
}

export default moveSelectionWithCursorKeys