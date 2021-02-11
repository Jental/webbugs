import { Cell, CellType } from "./cell";
import { Component } from "./component";
import { FullCoordinates } from "./coordinates";

export enum UpdateType {
  Field = 0,
  Components = 1,
  AddComponent = 2,
  RemoveComponent = 3
}

export class FieldUpdate {
  type: UpdateType = UpdateType.Field;

  p: FullCoordinates;
  playerID? : number;
  cellType?: CellType;
  component? : Component;

  constructor (p: FullCoordinates, update: { playerID?: number, cellType?: CellType, component?: Component }) {
    this.p = p;
    this.playerID = update.playerID;
    this.cellType = update.cellType;
    this.component = update.component;
  }
}

export class ComponentsUpdate {
  type: UpdateType = UpdateType.Components;

  id: string;
  isActive?: boolean;
  walls?: Cell[];

  constructor (id: string, update: { isActive?: boolean, walls?: Cell[] }) {
    this.id = id;
    this.isActive = update.isActive;
    this.walls = update.walls;
  }
}

export class AddComponentUdpate {
  type: UpdateType = UpdateType.AddComponent;

  component: Component;

  constructor (component: Component) {
    this.component = component;
  }
}

export class RemoveComponentUpdate {
  type: UpdateType = UpdateType.RemoveComponent;

  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export type Update = FieldUpdate | ComponentsUpdate | AddComponentUdpate | RemoveComponentUpdate;
