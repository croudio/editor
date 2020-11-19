import { Helper, Mode } from "../typings"

const updateMode = (mode: Mode): Helper => ({ setMode }) => {

    console.log("helper: setMode", mode);

    setMode(mode);
}

export default updateMode;