import { Change, Helper, Position, Update } from "../typings"


const moveSelection = (transition: Position): Helper => ({ elements, selection, onChange }) => {

    console.log("helper: moveSelection");

    const changes = elements
        .filter(element => selection.includes(element.id))
        .map<Update>(element => ({
            type: Change.Update,
            element: {
                ...element,
                x: element.x + transition.x,
                y: element.y + transition.y
            }
        }))

    onChange && onChange(changes)
}

export default moveSelection;