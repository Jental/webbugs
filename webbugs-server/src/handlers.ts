import * as _ from 'lodash';
import { Event, ClickEvent, EventType, SetBugEvent, SetWallEvent, UpdateComponentActivityEvent } from '../../webbugs-common/src/models/events';
import { Cell, CellType } from '../../webbugs-common/src/models/cell';
import { Component } from '../../webbugs-common/src/models/component';
import { FullCoordinates } from '../../webbugs-common/src/models/coordinates';
import { Field } from '../../webbugs-common/src/models/field';
import { Page } from '../../webbugs-common/src/models/page';
import { AddComponentUdpate, ComponentsUpdate, FieldUpdate, RemoveComponentUpdate, Update, UpdateType } from '../../webbugs-common/src/models/updates';

interface ProcessResult {
  events: Event[],
  updates: Update[]
}

const EmptyProcessResult : ProcessResult = { events: [], updates: [] };

export class FieldReducer {  
  private field: Field;
  private components: Record<string, Component>;
  private onFieldUpdate: () => void;

  constructor(field: Field, components: Record<string, Component>, onUpdate: () => void) {
    this.field = field;
    this.components = components;
    this.onFieldUpdate = onUpdate;
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

    console.log('events: process result:', result, events);
    
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
    // console.log('processClickEvent: value:', value);
    if (value === null || value === undefined) {
      const neighbours = page.getNeibhours(event.p.cell);
      const activeNeighbour =
        neighbours.find(n =>
          n.cell && n.cell.playerID === event.playerID && (
            n.cell.type === CellType.Bug
            || (n.cell.type === CellType.Wall && this.components[n.cell.component_id]?.isActive)));
      // console.log('processClickEvent: neighbours:', neighbours);
      // console.log('processClickEvent: activeNeighbour:', activeNeighbour);
      if (activeNeighbour !== null && activeNeighbour !== undefined) {
        return {
          events: [ new SetBugEvent(event.p, event.playerID, false) ],
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
            || (n.cell.type === CellType.Wall && this.components[n.cell.component_id]?.isActive)));
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

    console.log('processSetBugEvent: neighbours', neighbours);
    
    let newEvents : Event[] = [];
    let newUpdates : Update[] = [];

    const ownNeighbourWallCompnents : string[] =
      _.chain(neighbours)
      .filter(n => n.cell !== null && n.cell !== undefined && n.cell.type === CellType.Wall && n.cell.playerID === event.playerID)
      .map(n => n.cell.component_id)
      .uniq()
      .value();

    for (const compId of ownNeighbourWallCompnents) {
      newUpdates.push(new ComponentsUpdate(compId, { isActive: true }));
    }

    newUpdates.push(new FieldUpdate(
      event.p,
      {
        cellType: CellType.Bug,
        playerID: event.playerID,
        isBase: event.isBase
      }));

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
      p: event.p
    };

    const neighbours = page.getNeibhours(event.p.cell);
    const neighbourWallComponents : Component[] =
      _.chain(neighbours)
       .filter(n => n.cell !== null && n.cell !== undefined && n.cell.type === CellType.Wall && n.cell.playerID === event.playerID)
       .map(n => this.components[n.cell.component_id])
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
      .map(n => this.components[n.cell.component_id])
      .filter(c => !!c)
      .uniq()
      .value();

    console.log('events: processSetWallEvent: neighbours:', neighbourWallComponents.length);
    
    if (neighbourWallComponents.length === 0) {
      component = {
        id: _.uniqueId(),
        isActive: neighbourBugs.length > 0,
        walls: [ wall ]
      };

      newUpdates.push(new AddComponentUdpate(component));
    }
    else if (neighbourWallComponents.length === 1) {
      component = neighbourWallComponents[0];

      newUpdates.push(new ComponentsUpdate(
        component.id,
        {
          isActive: neighbourWallComponents[0].isActive || neighbourBugs.length > 0,
          walls: [...component.walls, wall]
        }));
    }
    else if (neighbourWallComponents.length > 1) {
      const allWalls = _.flatMap(neighbourWallComponents, n => n.walls);
      component = {
        id: _.uniqueId(),
        isActive: neighbourBugs.length > 0 || _.find(neighbourWallComponents, { isActive: true }) !== undefined,
        walls: [...allWalls, wall]
      };

      newUpdates.push(new AddComponentUdpate(component));

      for (const w of allWalls) {
        newUpdates.push(new FieldUpdate(
          w.p,
          { component: component }
        ));
      }

      for (const n of neighbourWallComponents) {
        newUpdates.push(new RemoveComponentUpdate(n.id));
      }
    }

    for (const n of allNeighbourWallComponents) {
      newEvents.push(new UpdateComponentActivityEvent(n));
    }

    newUpdates.push(new FieldUpdate(event.p, {
      cellType: CellType.Wall,
      component: component,
      playerID: event.playerID
    }));

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
    const isActive =
      _.chain(component.walls)
      .flatMap(w => page.getNeibhours(w.p.cell))
      .uniq()
      .filter(n => n.cell && n.cell.type === CellType.Bug && n.cell.playerID === playerID)
      .value()
      .length > 0;

    if (isActive !== component.isActive) {
      return {
        events: [],
        updates: [ new ComponentsUpdate(component.id, { isActive: isActive }) ]
      };
    }
    else {
      return { events: [], updates: [] };
    }
  }

  applyUpdates(updates: Update[]) : void {
    for (const update of updates) {
      console.log('events: update:', update.type, update);
      switch (update.type) {
        case UpdateType.Field:
          this.applyFieldUpdate(update as FieldUpdate);
          break;
        case UpdateType.Components:
          this.applyComponentsUpdate(update as ComponentsUpdate);
          break;
        case UpdateType.AddComponent:
          this.applyAddComponentUpdate(update as AddComponentUdpate);
          break;
        case UpdateType.RemoveComponent:
          this.applyRemoveComponentUpdate(update as RemoveComponentUpdate);
          break;
      }
    }
  }

  applyFieldUpdate(update: FieldUpdate) : void {
    const page = this.field.get(update.p.page);
    if (page) {
      const value = page.get(update.p.cell);
      page.set(
        update.p.cell,
        {
          ...value,
          type:
            update.cellType !== null && update.cellType !== undefined
            ? update.cellType
            : (value ? value.type : null),
          playerID:
            update.playerID !== null && update.playerID !== undefined
            ? update.playerID
            : (value ? value.playerID : null),
          component_id:
            update.component !== null && update.component !== undefined
            ? update.component.id
            : (value ? value.component_id : null),
          isBase: 
            update.isBase !== null && update.isBase !== undefined
            ? update.isBase
            : (value ? value.isBase : false),
          p: update.p
        });
    }
  }

  applyComponentsUpdate(update: ComponentsUpdate) : void {
    if (update.id === null || update.id === undefined) {
      return;
    }

    if (!(update.id in this.components)) {
      return;
    }

    if (update.walls) {
      this.components[update.id].walls = update.walls;
    }
    if (update.isActive !== null && update.isActive !== undefined) {
      this.components[update.id].isActive = update.isActive;
    }
  }

  applyAddComponentUpdate(update: AddComponentUdpate) : void {
    if (update.component.id in this.components) {
      return;
    }

    this.components[update.component.id] = update.component;
  }

  applyRemoveComponentUpdate(update: RemoveComponentUpdate) : void {
    delete this.components[update.id];
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
