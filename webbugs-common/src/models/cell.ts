import { Component } from "./component";
import { Coordinates } from "./coordinates";
import { Page } from "./page";

export enum CellType {
  Bug = 0,
  Wall = 1
}

export interface Cell {
  type: CellType,
  playerID: number,
  component?: Component,
  page: Page,
  p: Coordinates
}