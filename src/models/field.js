export default class Field {
  constructor(radius) {
    this.radius = radius;
    this.gridSize = 2 * radius - 1;
    this.grid = new Array(this.gridSize);
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = new Array(this.gridSize);
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = new Array(this.gridSize);
        for (let k = 0; k < this.gridSize; k++) {
          this.grid[i][j][k] = null;
        }
      }
    }
  }

  fillWithRandom() {
     console.log(this.gridSize);
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        for (let k = 0; k < this.gridSize; k++) {
          const rndVal = Math.random() * 10.0;
          if (rndVal >= 8.0 && rndVal < 9.0) {
            this.grid[i][j][k] = {
              type: 'bug',
              playerID : 1
            };
          }
          else if (rndVal >= 9.0 && rndVal < 10.0) {
            this.grid[i][j][k] = {
              type: 'wall',
              playerID : 1,
              bugID: 0
            };
          }
        }
      }
    }
  }

  get(x, y, z) {
    return this.grid[x + this.radius - 1][y + this.radius - 1][z + this.radius - 1];
  }
}
