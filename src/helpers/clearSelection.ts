import { Helper } from "../typings"


const clearSelection: Helper = ({ selection, select }) => {


    if (selection.length) {
        console.log("helper: clear selection", { selection });
        select([])
    }
}

export default clearSelection