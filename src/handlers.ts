import * as _ from 'lodash';
import { Cell, CellType } from './models/cell';
import { Coordinates, FullCoordinates } from './models/coordinates';
import { Field } from './models/field';
import { Page } from './models/page';

export enum EventType {
  Click = 'click',
  SetBug = 'set_bug',
  SetWall = 'set_wall',
  SetWallActive = 'set_wall_active',
  SetWallInactive = 'set_wall_inactive',
  AddWallToComponent = 'add_wall_to_component',
  RemoveWallFromComponent = 'remove_wall_from_component'
}

export interface Event {
  type : EventType,
  p: FullCoordinates,
  value: {
    type? : CellType,
    playerID? : number,
    isActive? : boolean
  } 
}

interface Update {
  p: FullCoordinates,
  value: {
    type? : CellType,
    playerID? : number,
    isActive? : boolean
  }
}

export class FieldReducer {  
  private field: Field;
  private onFieldUpdate: () => void;

  constructor(field: Field, onFieldUpdate: () => void) {
    this.field = field;
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
          .map(_.flatten)
          .value();
    
    return {
      // @ts-ignore - type confusion because of map+unzip
      events: result[0],
      updates: result[1]
    };
  }

  private processEvent(event: Event) : { events: Event[], updates: Update[] } {
    console.log('events: event:', event);
    let page;
    switch (event.type) {
    case EventType.Click:
      page = this.field.get(event.p.page);
      if (!page) {
        return { events: [], updates: [] }; 
      }

      if (event.value.playerID === null || event.value.playerID === undefined) {
        console.warn('processEvent: SetBug: playerID is missing', event);
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
    case EventType.SetBug:
      page = this.field.get(event.p.page);
      if (!page) {
        return { events: [], updates: [] }; 
      }

      if (event.value.playerID === null || event.value.playerID === undefined) {
        console.warn('processEvent: SetBug: playerID is missing', event);
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
          p: event.p,
          value: {
            type: CellType.Bug,
            playerID: event.value.playerID
          }
        }]
      };
    case EventType.SetWall:
      return {
        events: [],
        updates: [{
          p: event.p,
          value: {
            type: CellType.Wall,
            playerID: event.value.playerID
          }
        }]
      };
    case EventType.SetWallActive:
      return {
        events: [],
        updates: [{
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
    default:
      return { events: [], updates: [] };
    }
  }

  applyUpdates(updates: Update[]) : void {
    for (const update of updates) {
      console.log('events: update:', update);
      const page = this.field.get(update.p.page);
      if (page) {
        const value = page.get(update.p.cell);
        page.set(
          update.p.cell,
          {
            type:
              update.value.type !== null && update.value.type !== undefined
              ? update.value.type
              : (value ? value.type : null),
            playerID:
              update.value.playerID !== null && update.value.playerID !== undefined
              ? update.value.playerID
              : (value ? value.playerID : null),
            isActive:
              update.value.isActive !== null && update.value.isActive !== undefined
              ? update.value.isActive
              : (value ? value.isActive : true)
          });
      }
    }
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
