import _ from 'lodash';
import { Cell, CellType } from '../../../webbugs-common/src/models/cell';
import { Component } from '../../../webbugs-common/src/models/component';
import { Coordinates } from '../../../webbugs-common/src/models/coordinates';
import { Field } from '../../../webbugs-common/src/models/field';
import { ClickEvent, Event } from '../../../webbugs-common/src/models/events';

export class EatAI implements Iterable<Event> {
  private field: Field;
  private components: Record<string, Component>;
  playerID: string;

  constructor(field: Field, components: Record<string, Component>, playerID: string) {
    this.field = field;
    this.components = components;
    this.playerID = playerID;
  }

  [Symbol.iterator](): IterableIterator<Event> {
    return this;
  }

  next() : IteratorResult<Event> {
    const page = this.field.get({x: 0, y: 0, z: 0});
    const playerCells : Cell[] = page.getPlayerCells(this.playerID);
    const bugCells : Cell[] = playerCells.filter(c => c.type === CellType.Bug);
    const activeWallCells : Cell[] =
      playerCells
      .filter(c => c.type === CellType.Wall && c.component_id !== null && c.component_id !== undefined && c.component_id in this.components)
      .map(c => ({ cell: c, component: this.components[c.component_id]}))
      .filter(d => d.component.isActive)
      .map(d => d.cell);
    const allActiveCells = [...bugCells, ...activeWallCells];
    const allActiveCellNeighbours = _.flatMap(allActiveCells, c => page.getNeibhours(c.p.cell));
    const allActiveCellBugNeighbourCoordinates : Coordinates[] =
      allActiveCellNeighbours
      .filter(c => c.cell !== null && c.cell !== undefined && c.cell.type === CellType.Bug && c.cell.playerID !== this.playerID)
      .map(c => c.p);
    const allActiveCellEmptyNeighbourCoordinates : Coordinates[] =
      allActiveCellNeighbours
      .filter(c => c.cell === null || c.cell === undefined)
      .map(c => c.p);

    if (allActiveCellBugNeighbourCoordinates.length > 0) {
      const idx = Math.floor(Math.random() * allActiveCellBugNeighbourCoordinates.length);
      const result = new ClickEvent(
        {page: {x: 0, y: 0, z: 0}, cell: allActiveCellBugNeighbourCoordinates[idx]},
        this.playerID);
      
      return {
        done: false,
        value: result
      };    
    }
    else if (allActiveCellEmptyNeighbourCoordinates.length > 0) {
      const idx = Math.floor(Math.random() * allActiveCellEmptyNeighbourCoordinates.length);
      const result = new ClickEvent(
        {page: {x: 0, y: 0, z: 0}, cell: allActiveCellEmptyNeighbourCoordinates[idx]},
        this.playerID);
      
      return {
        done: false,
        value: result
      };
    }
    else {
      return {
        done: true,
        value: null
      };
    }
  }
}