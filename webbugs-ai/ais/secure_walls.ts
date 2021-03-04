import _ from 'lodash';
import { Cell, CellType } from '../../webbugs-common/src/models/cell';
import { Component } from '../../webbugs-common/src/models/component';
import { Coordinates } from '../../webbugs-common/src/models/coordinates';
import { Field } from '../../webbugs-common/src/models/field';
import { ClickContract } from '../../webbugs-common/src/contract/click_contract';
import { AI } from '../ai';
import { Observable } from 'rxjs';

// Eats first if possible.
// Don't come close to active enemy walls
// Places a bug from time to time near big wall components
export class SecureWallsAI extends AI {
  constructor(field$: Observable<Field>, components$: Observable<Record<string, Component>>, playerID: string) {
    super(field$, components$, playerID);
  }

  next() : IteratorResult<ClickContract> {
    if (!this.field || !this.components) {
      return { done : false, value: null };
    }
    
    const pageP: Coordinates = {x: 0, y: 0, z: 0};
    const page = this.field.get(pageP);
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
    const allActiveCellEmptyNeighbourCoordinatesWithNoWallNear =
      allActiveCellEmptyNeighbourCoordinates
      .map(p => ({
        isActiveNeighbourPreset:
          page
          .getNeibhours(p)
          .findIndex(n =>
            n.cell !== null && n.cell !== undefined
            && n.cell.playerID !== this.playerID && n.cell.type === CellType.Wall
            && n.cell.component_id in this.components
            && this.components[n.cell.component_id].isActive
          ) >= 0,
        p: p
      }))
      .filter(d => !d.isActiveNeighbourPreset)
      .map(d => d.p);
    const allWallComponents =
      _
      .chain(playerCells)
      .filter(c => c.type === CellType.Wall && c.component_id !== null && c.component_id !== undefined && c.component_id in this.components)
      .map(c => this.components[c.component_id])
      .uniq()
      .value();
    const bigWallComponents : Component[] =
      allWallComponents
      .filter(d => d.isActive && d.walls && d.walls.length >= 10);
    if (bigWallComponents && bigWallComponents.length > 0 && Math.random() < 0.1) {
      const cmpIdx = Math.floor(Math.random() * bigWallComponents.length)
      const cmp = bigWallComponents[cmpIdx];
      const freeNeigbours : Coordinates[] =
        _
        .chain(cmp.walls)
        .filter(w => !!w)
        .flatMap(w => page.getNeibhours(w.p.cell))
        .filter(n => !n.cell)
        .map(n => n.p)
        .uniq()
        .value();
      if (freeNeigbours.length > 0) {
        const nIdx = Math.floor(Math.random() * freeNeigbours.length);

        const result : ClickContract = {
          p: { page: pageP, cell: freeNeigbours[nIdx]},
          playerID: this.playerID
        };
        
        return {
          done: false,
          value: result
        };   
      }
      else {
        return {
          done: false,
          value: null
        }
      }
    }
    else if (allActiveCellBugNeighbourCoordinates.length > 0) {
      const idx = Math.floor(Math.random() * allActiveCellBugNeighbourCoordinates.length);
      const result : ClickContract = {
        p: {page: pageP, cell: allActiveCellBugNeighbourCoordinates[idx]},
        playerID: this.playerID
      };
      
      return {
        done: false,
        value: result
      };    
    }
    else if (allActiveCellEmptyNeighbourCoordinatesWithNoWallNear.length > 0) {
      const idx = Math.floor(Math.random() * allActiveCellEmptyNeighbourCoordinatesWithNoWallNear.length);
      const result : ClickContract = {
        p: {page: pageP, cell: allActiveCellEmptyNeighbourCoordinatesWithNoWallNear[idx]},
        playerID: this.playerID
      };
      
      return {
        done: false,
        value: result
      };      
    }
    else if (allActiveCellEmptyNeighbourCoordinates.length > 0) {
      const idx = Math.floor(Math.random() * allActiveCellEmptyNeighbourCoordinates.length);
      const result : ClickContract = {
        p: {page: pageP, cell: allActiveCellEmptyNeighbourCoordinates[idx]},
        playerID: this.playerID
      };
      
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