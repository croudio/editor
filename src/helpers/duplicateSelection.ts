import { Add, Change, Helper } from "../typings";

import { getUpperBounds } from "../utils/selection";


const DuplicateSelection: Helper = ({ elements, selection, generateId, select, onChange }) => {

    console.log("helper: duplicate");

    const selected = elements
        .filter(element => selection.includes(element.id));

    const bounds = getUpperBounds(selected)

    const changes = selected.map<Add>(element => ({
        type: Change.Add,
        element: {
            ...element,
            id: generateId(),
            x: element.x + bounds.width - bounds.x,
        }
    }))

    onChange && onChange(changes);

    select(changes.map(change => change.element.id))

}

export default DuplicateSelection