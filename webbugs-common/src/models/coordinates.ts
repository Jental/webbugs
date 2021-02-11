export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface FullCoordinates {
  page: Coordinates,
  cell: Coordinates
}
