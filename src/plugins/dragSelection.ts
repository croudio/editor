import { Add, Change, Mode, Plugin, Tool, Update } from "../typings"
import { snapTo } from "../utils/numbers";


const selectElement: Plugin = ({ tool, mode, grid, quantize, snapToGrid, changes, setChanges, generateId, down, elements, selection, pointerElement, pointerOffset, pointerPosition }) => {

    // Move the selection
    if (down && tool === Tool.Pointer && pointerElement && pointerOffset && pointerPosition && selection.length) {

        const changes = elements
            .filter(element => selection.includes(element.id))
            .map<Add | Update>(element => {

                const x = element.x + pointerOffset.x - pointerPosition.x;
                const y = element.y + pointerOffset.y - pointerPosition.y;

                const width = grid.width / quantize.width;
                const height = grid.height / quantize.height;

                return mode === Mode.Special
                    ? {
                        type: Change.Add,
                        element: {
                            ...element,
                            id: generateId(),
                            x: snapToGrid ? snapTo(x, width) : x,
                            y: snapToGrid ? snapTo(y, height) : y
                        }
                    }
                    : {
                        type: Change.Update,
                        element: {
                            ...element,
                            x: snapToGrid ? snapTo(x, width) : x,
                            y: snapToGrid ? snapTo(y, height) : y
                        }
                    }
            })

        // Temporary store the changes, so we don't always fire all movements
        setChanges(changes)

    }

    // Unregister
    return () => {

        if (!down && changes.length) {
            console.log("setChanges([])")
            setChanges([])
        }

    }

}

export default selectElement