import { Mode, Plugin, Tool } from "../typings"


const selectElement: Plugin = ({ tool, mode, down, element, selection, isSelected, select }) => {

    // Select the single element if it is not selected yet
    if (tool === Tool.Pointer && down && element && !isSelected(element)) {
        console.log("plugin: select element")
        mode === Mode.Special
            ? select([...selection, element.id])
            : select([element.id])
    }

}

export default selectElement