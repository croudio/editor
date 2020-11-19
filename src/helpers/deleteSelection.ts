import { Change, Helper, Remove } from "../typings"


const deleteSelection: Helper = ({ elements, selection, onChange }) => {

    const changes = elements
        .filter(element => selection.includes(element.id))
        .map<Remove>(element => ({ type: Change.Remove, element }))

    console.log("helper: delete selection", { elements, selection, changes, onChange });

    onChange && onChange(changes)
}

export default deleteSelection