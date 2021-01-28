import { Cell, CellType } from "./cell";
import { Coordinates } from "./coordinates";

// Page items are pointy-top:
//    /\
//   |  |
//    \/
export class Page {
  radius: number = 0;
  grid: Record<number, Cell> = {};

  constructor(radius: number) {
    this.radius = radius;

    for (let x = - this.radius + 1; x < this.radius - 1; x++) {
      for (let y = - this.radius + 1; y < this.radius - 1; y++) {
        this.grid[this.key({ x, y, z: 0-x-y })] = null;
      }
    }
    console.log('grid size:', Object.keys(this.grid).length);
  }

  private key(p: Coordinates) : number {
    return p.x + 4 * this.radius * p.y + 16 * Math.sqrt(this.radius) * p.z;
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
    ];
  }

  getNeibhours(p: Coordinates) : {p: Coordinates, cell: Cell}[] {
    return this.getNeibhourCoordinates(p)
      .map(p2 => ({ p: p2, cell: this.get(p2) }));
  }

  get(p: Coordinates) : Cell {
    return this.grid[this.key(p)];
  }

  isActiveA(p: Coordinates, playerID: number) : boolean {
    return this.isActive(p, playerID);
  }
  isActive(p: Coordinates, playerID: number) : boolean {
    const cellsToCheck = [p];
    const checkedCells = [];
    while (cellsToCheck.length > 0) {
      const cp = cellsToCheck.pop();
      const value = this.grid[this.key(cp)];
      console.log('value', cp, value);
      
      if (!value) {
        continue;
      }
      else if (value.type === CellType.Bug && value.playerID === playerID) {
        return true;
      }
      else if (value.type === CellType.Wall && value.playerID === playerID) {
        const neibhours = this.getNeibhourCoordinates(cp).filter(np => {
          const v = this.get(np);
          return v
            && v.playerID === playerID
            && checkedCells.findIndex(ccp => ccp.x === np.x && ccp.y === np.y && ccp.z === np.z) < 0;
        });
        console.log('neibhours', cp, neibhours);
        for (let n of neibhours) {
          cellsToCheck.push(n);
        }
      }

      console.log(cellsToCheck);
    }

    return false;
  }

  set(p: Coordinates, value: Cell) : void {
    console.log('page.set: value:', value);
    this.grid[this.key(p)] = {
      type: value.type,
      playerID: value.playerID,
      componentID: (value && value.componentID) ? value.componentID : null,
      isActive: (value && value.isActive === false) ? false : true
    };
    console.log('page.set: after', p, this.grid[this.key(p)]);
  }
}
