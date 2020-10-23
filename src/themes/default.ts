import Color from 'color'

const palette = {
    canvas: "ghostwhite",
    base: "slategrey",
    // active: "dodgerblue",
    // active: "cornflowerblue",
    active: "skyblue",
    primary: "yellowgreen"
}

interface ColorVariants {
    soft2: string;
    soft1: string;
    default: string;
    hard1: string;
    hard2: string;
}

const colors: Record<string, ColorVariants> = {
    canvas: {
        soft2: Color(palette.canvas).lighten(.6).hex(),
        soft1: Color(palette.canvas).lighten(.2).hex(),
        default: palette.canvas,
        hard1: Color(palette.canvas).darken(.2).hex(),
        hard2: Color(palette.canvas).darken(.6).hex(),
    },
    base: {
        soft2: Color(palette.base).lighten(.6).hex(),
        soft1: Color(palette.base).lighten(.2).hex(),
        default: palette.base,
        hard1: Color(palette.base).darken(.2).hex(),
        hard2: Color(palette.base).darken(.6).hex(),
    },
    active: {
        soft2: Color(palette.active).lighten(.6).hex(),
        soft1: Color(palette.active).lighten(.2).hex(),
        default: palette.active,
        hard1: Color(palette.active).darken(.2).hex(),
        hard2: Color(palette.active).darken(.6).hex()
    },
    primary: {
        soft2: Color(palette.primary).lighten(.4).hex(),
        soft1: Color(palette.primary).lighten(.2).hex(),
        default: palette.primary,
        hard1: Color(palette.primary).darken(.2).hex(),
        hard2: Color(palette.primary).darken(.4).hex()
    },
}

export default {
    element: {
        default: {
            fill: colors.base.default,
            stroke: colors.base.hard1,
            cursor: "move",
        },
        selected: {
            fill: colors.primary.default,
            stroke: colors.primary.hard1,
        },
        moving: {
            fill: colors.primary.soft2,
            stroke: colors.primary.soft1,
        },
        active: {
            fill: colors.active.default,
            stroke: colors.active.hard1,
        },
    },
    selection: {
        default: {
            stroke: colors.primary.default,
            fill: Color(colors.primary.default).alpha(0.2).toString()
        },
    },
    button: {
        default: {
            container: {
                fill: colors.base.default,
                stroke: colors.base.hard1,
            }
        },
        active: {
            container: {
                fill: colors.primary.default,
                stroke: colors.primary.hard1,
            }
        },
    },
    tools: {
        default: {
            fill: colors.base.soft2,

        }
    },
    key: {
        default: {
            fill: "white",
            stroke: colors.base.hard1,
            cursor: "pointer",
        },
        off: {
            fill: "black",
            stroke: colors.primary.hard1,
        },
        active: {
            fill: colors.active.default,
            stroke: colors.active.hard1,
        },
    },
    locator: {
        default: {
            stroke: colors.base.hard1,
        },
        active: {
            stroke: colors.active.default,
        },
    },
    timeline: {
        container: {
            default: {
                fill: "red",
                stroke: colors.base.hard1,
                cursor: "pointer",
            },
        }
    },
}
