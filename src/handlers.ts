import * as _ from 'lodash';
import { Cell, CellType } from './models/cell';
import { Component } from './models/component';
import { FullCoordinates } from './models/coordinates';
import { Field } from './models/field';
import { Page } from './models/page';

export enum EventType {
  Click = 'click',
  SetBug = 'set_bug',
  SetWall = 'set_wall',
  SetWallActive = 'set_wall_active',
  SetWallInactive = 'set_wall_inactive',
  AddWallToComponent = 'add_wall_to_component',
  RemoveWallFromComponent = 'remove_wall_from_component',
  MergeComponents = 'merge_components'
}

export interface Event {
  type : EventType,
  p: FullCoordinates,
  value: {
    type?       : CellType,
    playerID?   : number,
    isActive?   : boolean,
    component?  : Component,
    components? : Component[]
  } 
}

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

  private processEvents(events: Event[]) : { events: Event[], updates: Update[] } {
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

  private processEvent(event: Event) : { events: Event[], updates: Update[] } {
    console.log('events: event:', event.type, event.p?.page, event.p?.cell, event.value);
    switch (event.type) {
    case EventType.Click:
      return this.processClickEvent(event);
    case EventType.SetBug:
      return this.processSetBugEvent(event);
    case EventType.SetWall:
      return this.processSetWallEvent(event);
    case EventType.SetWallActive:
      return {
        events: [],
        updates: [{
          type: UpdateType.Field,
          p: event.p,
          value: {
            isActive: true
          }
        }]
      };
    case EventType.SetWallInactive:
      return {
        events: [],
        updates: [{
          type: UpdateType.Field,
          p: event.p,
          value: {
            isActive: false
          }
        }]
      };
    case EventType.AddWallToComponent:
      return { events: [], updates: [] };
    case EventType.RemoveWallFromComponent:
      return { events: [], updates: [] };
    case EventType.MergeComponents:
      return { events: [], updates: [] };
    default:
      return { events: [], updates: [] };
    }
  }

  processClickEvent(event: Event) : { events: Event[], updates: [] } {
    const page = this.field.get(event.p.page);
    if (!page) {
      return { events: [], updates: [] }; 
    }

    if (event.value.playerID === null || event.value.playerID === undefined) {
      console.warn('processClickEvent: playerID is missing', event);
      return { events: [], updates: [] }; 
    }

    const value = page.get(event.p.cell);
    
    if (value === null || value === undefined) {
      return {
        events: [{
          type: EventType.SetBug,
          p: event.p,
          value: {
            playerID : event.value.playerID
          }
        }],
        updates: []
      }
    }
    else if (value.type == CellType.Bug && value.playerID != event.value.playerID) {
      return {
        events: [{
          type: EventType.SetWall,
          p: event.p,
          value: {
            playerID : event.value.playerID
          }
        }],
        updates: []
      }
    }
    else {
      return { events: [], updates: [] };
    }
  }

  processSetBugEvent(event: Event) : { events: Event[], updates: Update[] } {
    const page = this.field.get(event.p.page);
    if (!page) {
      return { events: [], updates: [] }; 
    }

    if (event.value.playerID === null || event.value.playerID === undefined) {
      console.warn('processSetBugEvent: playerID is missing', event);
      return { events: [], updates: [] }; 
    }

    const neighbours = page.getNeibhours(event.p.cell);
    
    const newEvents : Event[] =
      neighbours
      .filter(n => n.cell && n.cell.type === CellType.Wall && n.cell.playerID == event.value.playerID)
      .map(n => ({
        type: EventType.SetWallActive,
        p: { page: event.p.page, cell: n.p},
        value: {
          isActive: true
        }
      }));

    return {
      events: newEvents,
      updates: [{
        type: UpdateType.Field,
        p: event.p,
        value: {
          type: CellType.Bug,
          playerID: event.value.playerID
        }
      }]
    };
  }

  processSetWallEvent(event: Event) : { events: Event[], updates: Update[] } {
    const page = this.field.get(event.p.page);
    if (!page) {
      return { events: [], updates: [] }; 
    }

    let newEvents : Event[] = [];
    let newUpdates : Update[] = [];
    let component : Component = null;

    const wall : Cell = {
      type: CellType.Wall,
      playerID: event.value.playerID,
      page: page,
      p: event.p.cell
    };

    const neighbours = page.getNeibhours(event.p.cell);
    const neighbourWallComponents =
      _.chain(neighbours)
       .filter(n => n.cell !== null && n.cell !== undefined && n.cell.type === CellType.Wall && n.cell.playerID === event.value.playerID)
       .map(n => n.cell.component)
       .filter(c => !!c)
       .uniq()
       .value();

    console.log('events: processSetWallEvent: neighbours:', neighbours, neighbourWallComponents.length);
    
    if (neighbourWallComponents.length === 0) {
      component = {
        id: _.uniqueId(),
        isActive: true,
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

      console.log('events: processSetWallEvent: [1]: walls count:', component.walls.length, 'id:', component.id);

      newUpdates.push({
        type: UpdateType.Components,
        id: component.id,
        value: {
          walls: [...component.walls, wall]
        }
      });
    }
    else if (neighbourWallComponents.length > 1) {
      const allWalls = _.flatMap(neighbourWallComponents, n => n.walls);
      component = {
        id: _.uniqueId(),
        isActive: true,
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

  processAddWallToComponentEvent(event: Event) : { events: Event[], updates: Update[] } {
    if (!event.value.component) {
      return { events: [], updates: [] }; 
    }

    const page = this.field.get(event.p.page);
    if (!page) {
      return { events: [], updates: [] }; 
    }

    const cell = page.get(event.p.cell);
    if (!cell || cell.type !== CellType.Wall) {
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
    else if (update.value.remove) {
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
