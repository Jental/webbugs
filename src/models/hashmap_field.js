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
}
