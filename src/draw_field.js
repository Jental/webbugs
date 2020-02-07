import * as pixi from 'pixi.js';

import SpritePool from './sprite_pool.js';
import { TEXTURE_EMPTY, TEXTURE_BUG, TEXTURE_WALL } from './const.js';

const draw = (field, app, viewport, cellOuterRadius) => {
  const innerRadius = cellOuterRadius * Math.sqrt(3) / 2.0;
  const outerRadius = cellOuterRadius;
  console.log(viewport.screenWidth, viewport.screenHeight);
  const fieldCenterH = viewport.screenWidth / 2.0;
  const fieldCenterV = viewport.screenHeight / 2.0;

  let antTexture = pixi.utils.TextureCache['ant.png'];

  for (let x = - field.radius + 1; x <= field.radius - 1; x++) {
    for (let y = - field.radius + 1; y <= field.radius - 1; y++) {
      for (let z = - field.radius + 1; z <= field.radius - 1; z++) {
        if (x + y + z === 0) {
          const offsetH = (x - y) * (innerRadius + 1);
          const offsetV = z * 1.5 * (outerRadius + 1);
          const cellValue = field.get(x, y, z);

	  let cell = null;
	  if (cellValue && cellValue.type === 'bug') {
	    cell = SpritePool.getInstance().get(TEXTURE_BUG);
	  }
	  else if (cellValue && cellValue.type === 'wall') {
	    cell = SpritePool.getInstance().get(TEXTURE_WALL);
	  }
	  else {
	    cell = SpritePool.getInstance().get(TEXTURE_EMPTY);
	  }
	  
	  if (cell) {
	    cell.position.set(fieldCenterH + offsetH, fieldCenterV + offsetV);
            viewport.addChild(cell);
	  }
        }
      }
    }
  }
};

export { draw };
