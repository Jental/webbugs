import { Coordinates } from './coordinates';
import { Page } from './page';

const MAX_FIELD_RADIUS = 1000;
const MAX_FIELD_RADIUS_SQ2 = 1000**2;

// Field items (pages) are flat-top:
//     _
//    / \
//    \_/
//
export class Field {
  private pageRadius : number;
  grid: Record<number, Page>;
  coordinates: Coordinates[] = [];

  constructor(pageRadius) {
    this.pageRadius = pageRadius;
    this.grid = {};
    this.create({ x: 0, y: 0, z: 0 });
  }

  private key(p: Coordinates) : number {
    return p.x + 4 * MAX_FIELD_RADIUS * p.y + 16 * MAX_FIELD_RADIUS_SQ2 * p.z;
  }

  get(p: Coordinates) : Page {
    return this.grid[this.key(p)];
  }

  create(p: Coordinates) : Page {
    const newPage = new Page(this.pageRadius);
    this.grid[this.key(p)] = newPage;
    this.coordinates.push(p);
    return newPage;
  }

  addPageTopRight(y: number) : Page {
    let x = 0;
    let z = -y;
    while (true) {
      const key = this.key({ x, y, z});
      if (!this.grid[key]) {
        break;
      }
      else {
        x = x + 1;
        z = z - 1;
      }
    }
    return this.create({ x, y, z });
  }
  
  addPageTopLeft(z: number) : Page {
    let x = -z;
    let y = 0;
    while (true) {
      const key = this.key({ x, y, z });
      if (!this.grid[key]) {
        break;
      }
      else {
        x = x - 1;
        y = y + 1;
      }
    }
    return this.create({ x, y, z });
  }

  addPageBottomRight(z: number) : Page {
    let x = 0;
    let y = -z;
    while (true) {
      const key = this.key({ x, y, z });
      if (!this.grid[key]) {
        break;
      }
      else {
        x = x + 1;
        y = y - 1;
      }
    }
    return this.create({ x, y, z });
  }

  addPageBottomLeft(y: number) : Page {
    let x = -y;
    let z = 0;
    while (true) {
      const key = this.key({ x, y, z });
      if (!this.grid[key]) {
        break;
      }
      else {
        x = x - 1;
        z = z + 1;
      }
    }
    return this.create({ x, y, z });
  }

  addPageTop(x: number) : Page {
    let y = 0;
    let z = -x;
    while (true) {
      const key = this.key({ x, y, z });
      if (!this.grid[key]) {
        break;
      }
      else {
        y = y + 1;
        z = z - 1;
      }
    }
    return this.create({ x, y, z });
  }

  addPageBottom(x: number) : Page {
    let y = -x;
    let z = 0;
    while (true) {
      const key = this.key({ x, y, z });
      if (!this.grid[key]) {
        break;
      }
      else {
        y = y - 1;
        z = z + 1;
      }
    }
    return this.create({ x, y, z });
  }

  getPageTopRight(y: number) : Page {
    const key = this.key(this.getPageTopRightCoordinates(y));
    return this.grid[key];
  }
  getPageTopRightCoordinates(y: number) : Coordinates {
    let x = 1;
    let z = -y-1;
    return { x,y,z };
  }
  
  getPageTopLeft(z: number) : Page {
    const key = this.key(this.getPageTopLeftCoordinates(z));
    return this.grid[key];
  }
  getPageTopLeftCoordinates(z: number) : Coordinates {
    let x = -z-1;
    let y = 1;
    return { x,y,z };
  }

  getPageBottomRight(z: number) : Page {
    const key = this.key(this.getPageBottomRightCoordinates(z));
    return this.grid[key];
  }
  getPageBottomRightCoordinates(z: number) : Coordinates {
    let x = 1;
    let y = -z-1;
    return { x,y,z };
  }

  getPageBottomLeft(y: number) : Page {
    const key = this.key(this.getPageBottomLeftCoordinates(y));
    return this.grid[key];
  }
  getPageBottomLeftCoordinates(y: number) : Coordinates {
    let x = -y-1;
    let z = 1;
    return { x,y,z };
  }

  getPageTop(x: number) : Page {
    const key = this.key(this.getPageTopCoordinates(x));
    return this.grid[key];
  }
  getPageTopCoordinates(x: number) : Coordinates {
    let y = 1;
    let z = -x-1;
    return { x,y,z };
  }

  getPageBottom(x) {
    const key = this.key(this.getPageBottomCoordinates(x));
    return this.grid[key];
  }
  getPageBottomCoordinates(x: number) : Coordinates {
    let y = -x-1;
    let z = 1;
    return { x,y,z };
  }
}
