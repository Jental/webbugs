export default class HashMapField {
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

  get(x, y, z) {
    return this.grid[this.key(x, y, z)];
  }

  fillWithRandom() {
    console.log('grid size [fill]:', Object.keys(this.grid).length);
    for (let x = - this.radius + 1; x < this.radius - 1; x++) {
      for (let y = - this.radius + 1; y < this.radius - 1; y++) {
        const z = 0 - x - y;
        const rndVal = Math.random() * 10.0;
        if (rndVal >= 8.0 && rndVal < 9.0) {
          this.grid[this.key(x,y,z)] = {
            type: 'bug',
            playerID : 1
          };
        }
        else if (rndVal >= 9.0 && rndVal < 10.0) {
          this.grid[this.key(x,y,z)] = {
            type: 'wall',
            playerID : 1,
            bugID: 0
          };
        }
      }
    }
  }
}
