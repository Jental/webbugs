import { Component } from "./component";
import { FullCoordinates } from "./coordinates";

export enum EventType {
  Click = 'click',
  SetBug = 'set_bug',
  SetWall = 'set_wall',
  UpdateComponentActivity = 'update_wall_activity',
}

export class ClickEvent {
  type: EventType = EventType.Click;
  p: FullCoordinates;
  playerID: number;

  constructor(p: FullCoordinates, playerID: number) {
    this.p = p;
    this.playerID = playerID;
  }
};

export class SetBugEvent {
  type: EventType = EventType.SetBug;
  p: FullCoordinates;
  playerID: number;

  constructor(p: FullCoordinates, playerID: number) {
    this.p = p;
    this.playerID = playerID;
  }
};

export class SetWallEvent {
  type: EventType = EventType.SetWall;
  p: FullCoordinates;
  playerID: number;

  constructor(p: FullCoordinates, playerID: number) {
    this.p = p;
    this.playerID = playerID;
  }
};

export class UpdateComponentActivityEvent {
  type: EventType = EventType.UpdateComponentActivity;
  component: Component;

  constructor (component: Component) {
    this.component = component;
  }
}

export type Event = ClickEvent | SetBugEvent | SetWallEvent | UpdateComponentActivityEvent;
