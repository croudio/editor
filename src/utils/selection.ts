import { Position, Bounds } from "../typings";


export const calculateBounds = (position: Position, offset: Position): Bounds => ({
    x: offset.x > position.x ? position.x : offset.x,
    y: offset.y > position.y ? position.y : offset.y,
    width: offset.x > position.x ? offset.x - position.x : position.x - offset.x,
    height: offset.y > position.y ? offset.y - position.y : position.y - offset.y
})

export const getUpperBounds = (bounds: Bounds[]): Bounds => {

    const x = Math.min(...bounds.map(bound => bound.x))
    const y = Math.min(...bounds.map(bound => bound.y))
    const width = Math.max(...bounds.map(bound => bound.x + bound.width))
    const height = Math.max(...bounds.map(bound => bound.y + bound.height))

    return { x, y, width, height }
}

export const isInBounds = (bounds: Bounds) => (subject: Bounds) => {

    return (
        (subject.x > bounds.x && subject.x < bounds.x + bounds.width)
        ||
        (subject.x + subject.width > bounds.x && subject.x + subject.width < bounds.x + bounds.width)
    )
        &&
        (
            (subject.y > bounds.y && subject.y < bounds.y + bounds.height)
            ||
            (subject.y + subject.height > bounds.y && subject.y + subject.height < bounds.y + bounds.height)
        )
}