import { Mode, Plugin, Tool } from "../typings"


const selectElement: Plugin = ({ mode, down, pointerElement, selection, isSelected, select }) => {

    // Select the single element if it is not selected yet
    if (down && pointerElement && !isSelected(pointerElement)) {
        console.log("plugin: select element")
        mode === Mode.Special
            ? select([...selection, pointerElement.id])
            : select([pointerElement.id])
    }

}

export default selectElement