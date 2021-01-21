import HashMapPage from './hashmap_page.js';

const MAX_FIELD_RADIUS = 1000;
const MAX_FIELD_RADIUS_SQ2 = 1000**2;

// Field items (pages) are flat-top:
//     _
//    / \
//    \_/
//
export default class Field {
  constructor(pageRadius) {
    this.pageRadius = pageRadius;
    this.grid = {};
    this.create(0, 0, 0);
  }

  key(x, y, z) {
    return x + 4 * MAX_FIELD_RADIUS * y + 16 * MAX_FIELD_RADIUS_SQ2 * z;
  }

  get(x, y, z) {
    return this.grid[this.key(x, y, z)].page;
  }

  create(x, y, z) {
    const newPage = new HashMapPage(this.pageRadius);
    const newPageData = {
      page: newPage,
      x, y, z
    };
    this.grid[this.key(x, y, z)] = newPageData;
    return newPageData;
  }

  addPageTopRight(y) {
    let x = 0;
    let z = -y;
    while (true) {
      const key = this.key(x, y, z);
      if (!this.grid[key]) {
        break;
      }
      else {
        x = x + 1;
        z = z - 1;
      }
    }
    return this.create(x, y, z);
  }
  
  addPageTopLeft(z) {
    let x = -z;
    let y = 0;
    while (true) {
      const key = this.key(x, y, z);
      if (!this.grid[key]) {
        break;
      }
      else {
        x = x - 1;
        y = y + 1;
      }
    }
    return this.create(x, y, z);
  }

  addPageBottomRight(z) {
    let x = 0;
    let y = -z;
    while (true) {
      const key = this.key(x, y, z);
      if (!this.grid[key]) {
        break;
      }
      else {
        x = x + 1;
        y = y - 1;
      }
    }
    return this.create(x, y, z);
  }

  addPageBottomLeft(y) {
    let x = -y;
    let z = 0;
    while (true) {
      const key = this.key(x, y, z);
      if (!this.grid[key]) {
        break;
      }
      else {
        x = x - 1;
        z = z + 1;
      }
    }
    return this.create(x, y, z);
  }

  addPageTop(x) {
    let y = 0;
    let z = -x;
    while (true) {
      const key = this.key(x, y, z);
      if (!this.grid[key]) {
        break;
      }
      else {
        y = y + 1;
        z = z - 1;
      }
    }
    return this.create(x, y, z);
  }

  addPageBottom(x) {
    let y = -x;
    let z = 0;
    while (true) {
      const key = this.key(x, y, z);
      if (!this.grid[key]) {
        break;
      }
      else {
        y = y - 1;
        z = z + 1;
      }
    }
    return this.create(x, y, z);
  }

  getPageTopRight(y) {
    let x = 1;
    let z = -y-1;
    const key = this.key(x, y, z);
    return this.grid[key];
  }
  getPageTopRightXYZ(y) {
    let x = 1;
    let z = -y-1;
    return [x,y,z];
  }
  
  getPageTopLeft(z) {
    let x = -z-1;
    let y = 1;
    const key = this.key(x, y, z);
    return this.grid[key];
  }
  getPageTopLeftXYZ(z) {
    let x = -z-1;
    let y = 1;
    return [x,y,z];
  }

  getPageBottomRight(z) {
    let x = 1;
    let y = -z-1;
    const key = this.key(x, y, z);
    return this.grid[key];
  }
  getPageBottomRightXYZ(z) {
    let x = 1;
    let y = -z-1;
    return [x,y,z];
  }

  getPageBottomLeft(y) {
    let x = -y-1;
    let z = 1;
    const key = this.key(x, y, z);
    return this.grid[key];
  }
  getPageBottomLeftXYZ(y) {
    let x = -y-1;
    let z = 1;
    return [x,y,z];
  }

  getPageTop(x) {
    let y = 1;
    let z = -x-1;
    const key = this.key(x, y, z);
    return this.grid[key];
  }
  getPageTopXYZ(x) {
    let y = 1;
    let z = -x-1;
    return [x,y,z];
  }

  getPageBottom(x) {
    let y = -x-1;
    let z = 1;
    const key = this.key(x, y, z);
    return this.grid[key];
  }
  getPageBottomXYZ(x) {
    let y = -x-1;
    let z = 1;
    return [x,y,z];
  }
}
