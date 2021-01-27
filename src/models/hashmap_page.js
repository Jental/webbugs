// Page items are pointy-top:
//    /\
//   |  |
//    \/
export default class HashMapPage {
  constructor(radius) {
    this.radius = radius;
    this.grid = {};

    for (let x = - this.radius + 1; x < this.radius - 1; x++) {
      for (let y = - this.radius + 1; y < this.radius - 1; y++) {
        this.grid[this.key(x, y, 0-x-y)] = null;
      }
    }
    console.log('grid size:', Object.keys(this.grid).length);
  }

  key(x, y, z) {
    return x + 4 * this.radius * y + 16 * Math.sqrt(this.radius) * z;
  }

  incByX(x, y, z) {
    return [x, y-1, z+1];
  }
  decByX(x, y, z) {
    return [x, y+1, z-1];
  }
  incByY(x, y, z) {
    return [x-1, y, z+1];
  }
  decByY(x, y, z) {
    return [x+1, y, z-1];
  }
  incByZ(x, y, z) {
    return [x+1, y-1, z];
  }
  decByZ(x, y, z) {
    return [x-1, y+1, z];
  }

  getNeibhours(x, y, z) {
    return [
      this.incByX(x,y,z),
      this.decByX(x,y,z),
      this.incByY(x,y,z),
      this.decByY(x,y,z),
      this.incByZ(x,y,z),
      this.decByZ(x,y,z)
    ];
  }

  get(x, y, z) {
    return this.grid[this.key(x, y, z)];
  }

  isActiveA([x, y, z], playerID) {
    return this.isActive(x, y, z, playerID);
  }
  isActive(x, y, z, playerID) {
    console.log(this.grid, this.key(x,y,z));
    const cellsToCheck = [[x,y,z]];
    const checkedCells = [];
    while (cellsToCheck.length > 0) {
      const [cx,cy,cz] = cellsToCheck.pop();
      const value = this.grid[this.key(cx,cy,cz)];
      console.log('value', cx, cy, cz, value);
      
      if (!value) {
        continue;
      }
      else if (value.type === 'bug' && value.playerID === playerID) {
        return true;
      }
      else if (value.type === 'wall' && value.playerID === playerID) {
        const neibhours = this.getNeibhours(cx,cy,cz).filter(([nx,ny,nz]) => {
          const v = this.get(nx, ny, nz);
          return v && v.playerID === playerID
            && checkedCells.findIndex(([ccx,ccy,ccz]) => ccx === nx && ccy === ny && ccz === nz) < 0;
        });
        console.log('neibhours', cx, cy, cz, neibhours);
        for (let n in neibhours) {
          cellsToCheck.push(n);
        }
      }

      console.log(cellsToCheck);
    }

    return false;
  }

  set(x, y, z, type, playerID, data) {
    this.grid[this.key(x,y,z)] = {
      type: type,
      playerID: playerID,
      component: (data && data.component) ? data.component : false,
      isActive: (data && data.isActive === false) ? false : true
    };
  }
}
