import * as _ from 'lodash';
import { Event, ClickEvent, EventType, SetBugEvent, SetWallEvent, UpdateComponentActivityEvent } from './events';
import { Cell, CellType } from './models/cell';
import { Component } from './models/component';
import { FullCoordinates } from './models/coordinates';
import { Field } from './models/field';
import { Page } from './models/page';

interface ProcessResult {
  events: Event[],
  updates: Update[]
}

const EmptyProcessResult : ProcessResult = { events: [], updates: [] };

enum UpdateType {
  Field = 0,
  Components = 1,
  CustomFn = 2
}

interface Update {
  type: UpdateType,
  p?: FullCoordinates,
  id?: string | number,
  value: {
    type? : CellType,
    playerID? : number,
    isActive? : boolean,
    walls?: Cell[],
    component? : Component
    remove?: boolean
  }
}

export class FieldReducer {  
  private field: Field;
  private components: Record<string, Component>;
  private onFieldUpdate: () => void;

  constructor(field: Field, components: Record<string, Component>, onFieldUpdate: () => void) {
    this.field = field;
    this.components = components;
    this.onFieldUpdate = onFieldUpdate;
  }

  handle(event : Event) : void {
    this.handleA([ event ]);
  }

  handleA(events: Event[]) : void {
    const processResult = this.processEvents(events);

    if (processResult.updates && processResult.updates.length > 0) {
      this.applyUpdates(processResult.updates);
    }

    if (processResult.events && processResult.events.length > 0) {
      setTimeout(() => { this.handleA(processResult.events); }, 100);
    }

    this.onFieldUpdate();
  }

  private processEvents(events: Event[]) : ProcessResult {
    const result = _
          .chain(events)
          .map(event => { const result = this.processEvent(event); return [ result.events, result.updates ]; })
          .unzip()
          .map(es => _.flatten<Event | Update>(es))
          .value();
    
    return {
      events: result[0] as Event[],
      updates: result[1] as Update[]
    };
  }

  private processEvent(event: Event) : ProcessResult {
    console.log('events: event:', event.type, event);
    switch (event.type) {
    case EventType.Click:
      return this.processClickEvent(event as ClickEvent);
    case EventType.SetBug:
      return this.processSetBugEvent(event as SetBugEvent);
    case EventType.SetWall:
      return this.processSetWallEvent(event as SetWallEvent);
    case EventType.UpdateComponentActivity:
      return this.processUpdateComponentActivityEvent(event as UpdateComponentActivityEvent);
    default:
      return { events: [], updates: [] };
    }
  }

  processClickEvent(event: ClickEvent) : ProcessResult {
    const page = this.field.get(event.p.page);
    if (!page) {
      return { events: [], updates: [] }; 
    }

    const value = page.get(event.p.cell);
    
    if (value === null || value === undefined) {
      const neighbours = page.getNeibhours(event.p.cell);
      const activeNeighbour =
        neighbours.find(n =>
          n.cell && n.cell.playerID === event.playerID && (
            n.cell.type === CellType.Bug
            || (n.cell.type === CellType.Wall && n.cell.component?.isActive)));
      if (activeNeighbour !== null && activeNeighbour !== undefined) {
        return {
          events: [ new SetBugEvent(event.p, event.playerID) ],
          updates: []
        }
      }
      else {
        return EmptyProcessResult; 
      }
    }
    else if (value.type == CellType.Bug && value.playerID != event.playerID) {
      const neighbours = page.getNeibhours(event.p.cell);
      const activeNeighbour =
        neighbours.find(n =>
          n.cell && n.cell.playerID === event.playerID && (
            n.cell.type === CellType.Bug
            || (n.cell.type === CellType.Wall && n.cell.component?.isActive)));
      if (activeNeighbour !== null && activeNeighbour !== undefined) {
        return {
          events: [ new SetWallEvent(event.p, event.playerID) ],
          updates: []
        }
      }
      else {
        return EmptyProcessResult;  
      }
    }
    else {
      return EmptyProcessResult;
    }
  }

  processSetBugEvent(event: SetBugEvent) : ProcessResult {
    const page = this.field.get(event.p.page);
    if (!page) {
      return { events: [], updates: [] }; 
    }

    const neighbours = page.getNeibhours(event.p.cell);
    
    let newEvents = [];
    let newUpdates = [];

    const ownNeighbourWallCompnents : Component[] =
      _.chain(neighbours)
      .filter(n => n.cell !== null && n.cell !== undefined && n.cell.type === CellType.Wall && n.cell.playerID === event.playerID)
      .map(n => n.cell.component)
      .uniq()
      .value();

    for (const comp of ownNeighbourWallCompnents) {
      newUpdates.push({
        type: UpdateType.Components,
        id: comp.id,
        value: {
          isActive: true
        }
      });
    }

    newUpdates.push({
      type: UpdateType.Field,
      p: event.p,
      value: {
        type: CellType.Bug,
        playerID: event.playerID
      }
    });

    return {
      events: newEvents,
      updates: newUpdates
    };
  }

  processSetWallEvent(event: SetWallEvent) : ProcessResult {
    const page = this.field.get(event.p.page);
    if (!page) {
      return { events: [], updates: [] }; 
    }

    let newEvents : Event[] = [];
    let newUpdates : Update[] = [];
    let component : Component = null;

    const wall : Cell = {
      type: CellType.Wall,
      playerID: event.playerID,
      page: page,
      p: event.p.cell
    };

    const neighbours = page.getNeibhours(event.p.cell);
    const neighbourWallComponents : Component[] =
      _.chain(neighbours)
       .filter(n => n.cell !== null && n.cell !== undefined && n.cell.type === CellType.Wall && n.cell.playerID === event.playerID)
       .map(n => n.cell.component)
       .filter(c => !!c)
       .uniq()
       .value();
    const neighbourBugs =
      _.filter(
        neighbours,
        n => n.cell !== null && n.cell !== undefined && n.cell.type === CellType.Bug && n.cell.playerID === event.playerID);
    const allNeighbourWallComponents : Component[] = 
      _.chain(neighbours)
      .filter(n => n.cell !== null && n.cell !== undefined && n.cell.type === CellType.Wall)
      .map(n => n.cell.component)
      .filter(c => !!c)
      .uniq()
      .value();  
    
    if (neighbourWallComponents.length === 0) {
      component = {
        id: _.uniqueId(),
        isActive: neighbourBugs.length > 0,
        walls: [ wall ]
      };

      newUpdates.push({
        type: UpdateType.Components,
        id: component.id,
        value: component
      });
    }
    else if (neighbourWallComponents.length === 1) {
      component = neighbourWallComponents[0];

      newUpdates.push({
        type: UpdateType.Components,
        id: component.id,
        value: {
          isActive: neighbourWallComponents[0].isActive || neighbourBugs.length > 0,
          walls: [...component.walls, wall]
        }
      });
    }
    else if (neighbourWallComponents.length > 1) {
      const allWalls = _.flatMap(neighbourWallComponents, n => n.walls);
      component = {
        id: _.uniqueId(),
        isActive: neighbourBugs.length > 0 || _.find(neighbourWallComponents, { isActive: true }) !== undefined,
        walls: [...allWalls, wall]
      };

      newUpdates.push({
        type: UpdateType.Components,
        id: component.id,
        value: component
      });

      for (const w of allWalls) {
        newUpdates.push({
          type: UpdateType.Field,
          p: { page: { x: 0, y: 0, z: 0 }, cell: w.p }, // TODO: real page coordinates
          value: {
            component: component
          }
        });
      }

      for (const n of neighbourWallComponents) {
        newUpdates.push({
          type: UpdateType.Components,
          id: n.id,
          value: { remove: true }
        });
      }
    }

    for (const n of allNeighbourWallComponents) {
      newEvents.push(new UpdateComponentActivityEvent(n));
    }

    wall.component = component;
    newUpdates.push({
      type: UpdateType.Field,
      p: event.p,
      value: wall
    });

    return {
      events: newEvents,
      updates: newUpdates
    };
  }

  processUpdateComponentActivityEvent(event: UpdateComponentActivityEvent)  : ProcessResult{
    const component = event.component;
    if (!component || component.walls.length === 0) {
      return { events: [], updates: [] }; 
    }
    const page = this.field.get({x: 0, y: 0, z: 0}); // TODO: fix coordinates
    const playerID = component.walls[0].playerID;
    const isActive0 =
      _.chain(component.walls)
      .flatMap(w => page.getNeibhours(w.p))
      .uniq()
      .filter(n => n.cell && n.cell.type === CellType.Bug && n.cell.playerID === playerID)
      .value()
      .length > 0;
    const isActive1 = false;//this.field.get({x: 0, y: 0, z: 0}).isActive(component.walls[0].p, 1); // TODO: for all players, fix coordinates
    const isActive = isActive0 || isActive1;
    if (isActive !== component.isActive) {
      return {
        events: [],
        updates: [{
          type: UpdateType.Components,
          id: component.id,
          value: {
            isActive: isActive
          }
        }]
      };
    }
    else {
      return { events: [], updates: [] };
    }
  }

  applyUpdates(updates: Update[]) : void {
    for (const update of updates) {
      switch (update.type) {
        case UpdateType.Field:
          this.applyFieldUpdate(update);
          break;
        case UpdateType.Components:
          this.applyComponentsUpdate(update);
          break;
      }
    }
  }

  applyFieldUpdate(update: Update) : void {
    console.log('events: field update:', update);
    const page = this.field.get(update.p.page);
    if (page) {
      const value = page.get(update.p.cell);
      page.set(
        update.p.cell,
        {
          ...value,
          type:
            update.value.type !== null && update.value.type !== undefined
            ? update.value.type
            : (value ? value.type : null),
          playerID:
            update.value.playerID !== null && update.value.playerID !== undefined
            ? update.value.playerID
            : (value ? value.playerID : null),
          component:
            update.value.component !== null && update.value.component !== undefined
            ? update.value.component
            : (value ? value.component : null),
          isActive:
            update.value.isActive !== null && update.value.isActive !== undefined
            ? update.value.isActive
            : (value ? value.isActive : true)
        });
    }
  }

  applyComponentsUpdate(update: Update) : void {
    console.log('events: components update:', update);

    if (update.id === null || update.id === undefined) {
      return;
    }

    if (update.value.walls) {
      if (update.id in this.components) {
        this.components[update.id].walls = update.value.walls;
      }
      else {
        this.components[update.id] = update.value as Component;
      }
    }
    if (update.value.isActive !== null && update.value.isActive !== undefined) {
      if (update.id in this.components) {
        this.components[update.id].isActive = update.value.isActive;
      }
    }
    if (update.value.remove) {
      delete this.components[update.id];
    }

    console.log('events: updated components: ', this.components);
  }
}

export const setCell = (p: FullCoordinates, field: Field, newValue: Cell) : void => {
  const page = field.get(p.page);
  if (page) {
    const oldValue = page.get(p.cell);
    console.log(p.page.x, p.page.y, p.page.z, '|', p.cell.x, p.cell.y, p.cell.z, '|', oldValue, '->', newValue);

    page.set(p.cell, newValue);

    handleBorderCell(p, page, field, newValue);
  }

  // @ts-ignore
  if (window.redraw) {
    // @ts-ignore
    window.redraw();
  }
};

const handleBorderCell = (p: FullCoordinates, page: Page, field: Field, newValue: Cell) : void => {
  const isOnXTopBorder    = p.cell.x === page.radius - 1;
  const isOnXBottomBorder = p.cell.x === - page.radius + 1;
  const isOnYTopBorder    = p.cell.y === page.radius - 1;
  const isOnYBottomBorder = p.cell.y === - page.radius + 1;
  const isOnZTopBorder    = p.cell.z === page.radius - 1;
  const isOnZBottomBorder = p.cell.z === - page.radius + 1;
  if (isOnXTopBorder) {
    console.log('top-right border');
    const neighbour = field.getPageTopRight(p.page.y);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = - page.radius + 1;
      const ny = - p.cell.z;
      const nz = - p.cell.y;

      neighbour.set({ x: nx, y: ny, z: nz }, newValue);
    }
  }
  if (isOnXBottomBorder) {
    console.log('bottom-left border');
    const neighbour = field.getPageBottomLeft(p.page.y);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = page.radius - 1;
      const ny = - p.cell.z;
      const nz = - p.cell.y;

      neighbour.set({ x: nx, y: ny, z: nz }, newValue);
    }
  }
  if (isOnYTopBorder) {
    console.log('top-left border');
    const neighbour = field.getPageTopLeft(p.page.z);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = - p.cell.z;
      const ny = - page.radius + 1;
      const nz = - p.cell.x;

      neighbour.set({ x: nx, y: ny, z: nz }, newValue);
    }
  }
  if (isOnYBottomBorder) {
    console.log('bottom-right border');
    const neighbour = field.getPageBottomRight(p.page.z);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = - p.cell.z;
      const ny = page.radius - 1;
      const nz = - p.cell.x;

      neighbour.set({ x: nx, y: ny, z: nz }, newValue);
    }
  }
  if (isOnZTopBorder) {
    console.log('bottom border');
    const neighbour = field.getPageBottom(p.page.x);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = - p.cell.y;
      const ny = - p.cell.x;
      const nz = - page.radius + 1;

      neighbour.set({ x: nx, y: ny, z: nz }, newValue);
    }
  }
  if (isOnZBottomBorder) {
    console.log('top border');
    const neighbour = field.getPageTop(p.page.x);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = - p.cell.y;
      const ny = - p.cell.x;
      const nz = page.radius - 1;

      neighbour.set({ x: nx, y: ny, z: nz }, newValue);
    }
  }
};
