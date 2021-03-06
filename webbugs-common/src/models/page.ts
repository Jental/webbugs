import { Cell, CellType } from "./cell";
import { Coordinates } from "./coordinates";
// @ts-ignore
import _ from 'lodash';

// Page items are pointy-top:
//    /\
//   |  |
//    \/
export class Page {
  radius: number = 0;
  grid: Record<number, Cell> = {};
  p: Coordinates;

  constructor(radius: number, p: Coordinates) {
    this.radius = radius;
    this.p = p;

    for (let x = - this.radius + 1; x < this.radius - 1; x++) {
      for (let y = - this.radius + 1; y < this.radius - 1; y++) {
        this.grid[this.key({ x, y, z: 0-x-y })] = null;
      }
    }
    // console.log('grid size:', Object.keys(this.grid).length);
  }

  static fromObject(page: Page) : Page {
    const newPage = new Page(page.radius, page.p);
    newPage.grid = page.grid;

    return newPage;
  }

  private key(p: Coordinates) : number {
    return p.x + 4 * this.radius * p.y + 16 * this.radius**2 * p.z;
  }

  incByX(p: Coordinates) : Coordinates {
    return {
      x: p.x,
      y: p.y-1,
      z: p.z+1
    };
  }
  decByX(p: Coordinates) : Coordinates {
    return {
      x: p.x,
      y: p.y+1,
      z: p.z-1
    };
  }
  incByY(p: Coordinates) : Coordinates {
    return {
      x: p.x-1, 
      y: p.y,
      z: p.z+1
    };
  }
  decByY(p: Coordinates) : Coordinates {
    return {
      x: p.x+1,
      y: p.y,
      z: p.z-1
    };
  }
  incByZ(p: Coordinates) : Coordinates {
    return {
      x: p.x+1,
      y: p.y-1,
      z: p.z
    };
  }
  decByZ(p: Coordinates) : Coordinates {
    return {
      x: p.x-1,
      y: p.y+1,
      z: p.z
    };
  }

  getNeibhourCoordinates(p: Coordinates) : Coordinates[] {
    return [
      this.incByX(p),
      this.decByX(p),
      this.incByY(p),
      this.decByY(p),
      this.incByZ(p),
      this.decByZ(p)
    ]
    .filter(p => Math.abs(p.x) < this.radius && Math.abs(p.y) < this.radius && Math.abs(p.z) < this.radius);
  }

  getNeibhours(p: Coordinates) : {p: Coordinates, cell: Cell}[] {
    return this.getNeibhourCoordinates(p)
      .map(p2 => ({ p: p2, cell: this.get(p2) }));
  }

  get(p: Coordinates) : Cell {
    return this.grid[this.key(p)];
  }
  
  set(p: Coordinates, value: Cell) : void {
    if (value) {
      this.grid[this.key(p)] = {
        type: value.type,
        playerID: value.playerID,
        component_id: (value && value.component_id !== undefined) ? value.component_id : null,
        p: value.p,
        isBase: (value.isBase !== null || value.isBase !== undefined) ? value.isBase : false
      };
    }
    else {
      this.grid[this.key(p)] = null;
    }
  }

  getRandomEmptyCellCoordinates(): Promise<Coordinates> {
    return new Promise((resolve) => {
      while(true) {
        const p : Coordinates = {
          x : Math.floor(Math.random() * (2 * this.radius - 1)) - this.radius + 1,
          y : Math.floor(Math.random() * (2 * this.radius - 1)) - this.radius + 1,
          z: 0
        };
        p.z = 0 - p.x - p.y;
        if (Math.abs(p.z) >= this.radius) {
          continue;
        }

        const key = this.key(p);
        if (!(key in this.grid) || this.grid[key] === null) {
          resolve(p);
          break;
        }
      }
    });
  }

  getPlayerCells(playerID: string) : Cell[] {
    return Object.values(this.grid).filter(c => c !== null && c !== undefined && c.playerID === playerID);
  }

  removePlayer(playerID: string): void {
    const ps = this.getPlayerCells(playerID).map(c => c.p.cell);
    for (const p of ps) {
      this.set(p, null);
    }
  }
}
