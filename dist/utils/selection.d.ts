import { Position, Bounds } from "../typings";
export declare const calculateBounds: (position: Position, offset: Position) => Bounds;
export declare const getUpperBounds: (bounds: Bounds[]) => Bounds;
export declare const isInBounds: (bounds: Bounds) => (subject: Bounds) => boolean;
