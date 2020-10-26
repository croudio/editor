import { Change, Element } from "../typings"


export default (state: Element[], action: any) => {

    switch (action.type) {

        case Change.Add:
            return [...state, action.element]

        case Change.Update:
            return state.map(element => element.id === action.element.id
                ? { ...element, ...action.element }
                : element
            )

        case Change.Remove:
            return state.filter(element => element.id !== action.id)

        // case Change.Batch:
        //     return action.changes.reduce<Element[]>(elementReducer, state);

        default:
            return state
    }
}