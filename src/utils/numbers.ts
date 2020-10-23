
export const snapTo = (value: number, snap: number) => Math.round(value / snap) * snap;
export const floorTo = (value: number, snap: number) => Math.floor(value / snap) * snap;
export const ceilTo = (value: number, snap: number) => Math.ceil(value / snap) * snap;
