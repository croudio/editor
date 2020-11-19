import { Helper } from "../typings"


const selectAll: Helper = ({ elements, select }) => {

    console.log("helper: selectAll");

    select(elements.map(element => element.id))
}

export default selectAll