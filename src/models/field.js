import { Graphics, utils, Sprite } from 'pixi.js';

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

  draw(app, viewport, cellOuterRadius) {
    const innerRadius = cellOuterRadius * Math.sqrt(3) / 2.0;
    const outerRadius = cellOuterRadius;
    console.log(viewport.screenWidth, viewport.screenHeight);
    const fieldCenterH = viewport.screenWidth / 2.0;
    const fieldCenterV = viewport.screenHeight / 2.0;

    let antTexture = utils.TextureCache['ant.png'];

    for (let x = -this.radius + 1; x <= this.radius - 1; x++) {
      for (let y = -this.radius + 1; y <= this.radius - 1; y++) {
        for (let z = -this.radius + 1; z <= this.radius - 1; z++) {
          if (x + y + z === 0) {
            const offsetH = (x - y) * innerRadius;
            const offsetV = z * 1.5 * outerRadius;
            const centerH = fieldCenterH + offsetH;
            const centerV = fieldCenterV + offsetV;

            const cellValue = this.get(x, y, z);

            let cell = new Graphics();
            cell.lineStyle(1, 0xD0D0D0, 1);
            if (cellValue && cellValue.type === 'wall') {
              cell.beginFill(0x000000);
            }

            const path = [
              centerH - innerRadius, centerV + outerRadius / 2.0,
              centerH - innerRadius, centerV - outerRadius / 2.0,
              centerH, centerV - outerRadius,
              centerH + innerRadius, centerV - outerRadius / 2.0,
              centerH + innerRadius, centerV + outerRadius / 2.0,
              centerH, centerV + outerRadius,
              centerH - innerRadius, centerV + outerRadius / 2.0
            ];
            cell.drawPolygon(path);

            if (cellValue && cellValue.type === 'wall') {
              cell.endFill();
            }
            viewport.addChild(cell);

            if (cellValue && cellValue.type === 'bug') {
              let sprite = new Sprite(antTexture);
              sprite.x = centerH - innerRadius;
              sprite.y = centerV - innerRadius;
              sprite.width = innerRadius * 2.0;
              sprite.height = innerRadius * 2.0;
              viewport.addChild(sprite);
            }
          }
        }
      }
    }
  }
}
