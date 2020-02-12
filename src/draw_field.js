import * as pixi from 'pixi.js';

import SpritePool from './sprite_pool.js';
import { TEXTURE_EMPTY, TEXTURE_BUG, TEXTURE_WALL } from './const.js';

const CELL_BORDER = 1;

const draw = (field, app, viewport, pageRadius, cellOuterRadius) => {
  console.log(viewport.screenWidth, viewport.screenHeight);
  const fieldCenterH = viewport.screenWidth / 2.0;
  const fieldCenterV = viewport.screenHeight / 2.0;

  for (let page of Object.values(field.grid)) {
    const cellInnerRadius = cellOuterRadius * Math.sqrt(3) / 2.0;
    console.log(page, pageRadius, cellInnerRadius, cellOuterRadius);
    const outerRadius = (pageRadius - 0.5) * 2 * (cellInnerRadius + CELL_BORDER) + cellInnerRadius / 2.0;
    const innerRadius =
	  pageRadius % 2 === 0 
	  ? (pageRadius / 2 + (pageRadius / 2 - 1) * 2 + 1) * cellOuterRadius
	  : ((pageRadius - 1) * 1.5 + 1) * cellOuterRadius;
    const offsetH = page.x * 1.5 * outerRadius;
    const offsetV = (page.z - page.y) * innerRadius;
    console.log(innerRadius, outerRadius, offsetH, offsetV, fieldCenterH + offsetH, fieldCenterV + offsetV);
    drawPage(page.page, viewport, cellOuterRadius, fieldCenterH + offsetH, fieldCenterV + offsetV);
  }
};

const drawPage = (page, viewport, cellOuterRadius, centerH, centerV) => {
  const innerRadius = cellOuterRadius * Math.sqrt(3) / 2.0;
  const outerRadius = cellOuterRadius;

  console.log('center', centerH, centerV);

  const pageCtr = new pixi.Container();

  for (let x = - page.radius + 1; x <= page.radius - 1; x++) {
    for (let y = - page.radius + 1; y <= page.radius - 1; y++) {
      for (let z = - page.radius + 1; z <= page.radius - 1; z++) {
        if (x + y + z === 0) {
          const offsetH = (x - y) * (innerRadius + CELL_BORDER);
          const offsetV = z * 1.5 * (outerRadius + CELL_BORDER);
          const cellValue = page.get(x, y, z);

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
	    cell.anchor.x = 0.5;
	    cell.anchor.y = 0.5;
	    if (x === 0 && y === 0) {
	      console.log('cell size', innerRadius, outerRadius);
	    }
	    cell.position.set(offsetH, offsetV);
            pageCtr.addChild(cell);
	  }
        }
      }
    }
  }

  pageCtr.interactive = true;
  pageCtr.on('mouseup', (e) => {
    console.log('mouseup', e.data.global.x, e.data.global.y);
  });

  pageCtr.position.set(centerH, centerV);
  viewport.addChild(pageCtr);
};

export { draw };
