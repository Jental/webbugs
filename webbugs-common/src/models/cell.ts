import { Component } from "./component";
import { Coordinates, FullCoordinates } from "./coordinates";
import { Page } from "./page";

export enum CellType {
  Bug = 0,
  Wall = 1
}

export interface Cell {
  type: CellType,
  playerID: string,
  component_id?: string,
  p: FullCoordinates,
  isBase?: boolean
}