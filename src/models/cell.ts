export enum CellType {
  Bug = 0,
  Wall = 1
}

export interface Cell {
  type: CellType,
  playerID: number,
  componentID?: number,
  isActive?: boolean
}