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
  playerID? : string;
  cellType?: CellType;
  component? : Component;
  isBase? : boolean;

  constructor (p: FullCoordinates, update: { playerID?: string, cellType?: CellType, component?: Component, isBase?: boolean }) {
    this.p = p;
    this.playerID = update.playerID;
    this.cellType = update.cellType;
    this.component = update.component;
    this.isBase = update.isBase;
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
