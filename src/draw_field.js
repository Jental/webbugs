import * as pixi from 'pixi.js';

import SpritePool from './sprite_pool.js';
import { TEXTURE_EMPTY, TEXTURE_BUG_0, TEXTURE_WALL_0, TEXTURE_BUG_1, TEXTURE_WALL_1 } from './const.js';

const CELL_BORDER = 3;

const draw = (field, app, viewport, pageRadius, cellOuterRadius) => {
  console.log(viewport.screenWidth, viewport.screenHeight);
  const fieldCenterH = viewport.screenWidth / 2.0;
  const fieldCenterV = viewport.screenHeight / 2.0;

  for (let page of Object.values(field.grid)) {
    const cellInnerRadius = cellOuterRadius * Math.sqrt(3) / 2.0;
    console.log('draw:', page, pageRadius, cellInnerRadius, cellOuterRadius);
    const outerRadius = (pageRadius * 2 - 1) * (cellInnerRadius + 0.5 + CELL_BORDER) + (3 - CELL_BORDER); // last part - emperical fix
    const innerRadius =
          pageRadius % 2 === 0 
          ? ((pageRadius - 2) / 2 * 2 + pageRadius / 2 + 1 + 0.5) * (cellOuterRadius + 0.5) + (pageRadius - 1) * CELL_BORDER * Math.sqrt(3) / 2.0 + (CELL_BORDER * Math.sqrt(3) * (pageRadius - 1) / 4) // last part - emperical fix
          : ((pageRadius - 1) * 1.5 + 1) * (cellOuterRadius + 0.5)  + (pageRadius - 1) * CELL_BORDER * Math.sqrt(3) / 2.0 + (CELL_BORDER * Math.sqrt(3) * (pageRadius - 1) / 4); // last part - emperical fix
    const offsetH = page.x * 1.5 * outerRadius;
    const offsetV = (page.z - page.y) * innerRadius;
    console.log(innerRadius, outerRadius, offsetH, offsetV, fieldCenterH + offsetH, fieldCenterV + offsetV);
    drawPage(page, viewport, cellOuterRadius, fieldCenterH + offsetH, fieldCenterV + offsetV);
  }
};

const drawPage = (pageData, viewport, cellOuterRadius, centerH, centerV) => {
  const page = pageData.page;
  const innerRadius = Math.ceil(cellOuterRadius * Math.sqrt(3) / 2.0);
  const outerRadius = cellOuterRadius;

  console.log('center', centerH, centerV);

  const pageCtr = new pixi.Container();

  for (let x = - page.radius + 1; x <= page.radius - 1; x++) {
    for (let y = - page.radius + 1; y <= page.radius - 1; y++) {
      for (let z = - page.radius + 1; z <= page.radius - 1; z++) {
        if (x + y + z === 0) {
          const offsetH = (x - y) / 2 * (2 * innerRadius + 1 + CELL_BORDER);
          const offsetV = z * (1.5 * outerRadius + 1 + CELL_BORDER * Math.sqrt(3) / 2);
          const cellValue = page.get(x, y, z);

          let cell = null;
          if (cellValue && cellValue.type === 'bug') {
            let spriteName = null;
            switch (cellValue.playerID) {
            case 0:
              spriteName = TEXTURE_BUG_0;
              break;
            case 1:
              spriteName = TEXTURE_BUG_1;
              break;
            }
            if (spriteName) {
              cell = SpritePool.getInstance().get(spriteName);
              console.log('bug cell', cell);
            }
          }
          else if (cellValue && cellValue.type === 'wall') {
            let spriteName = null;
            switch (cellValue.playerID) {
            case 0:
              spriteName = TEXTURE_WALL_0;
              break;
            case 1:
              spriteName = TEXTURE_WALL_1;
              break;
            }
            if (spriteName) {
              cell = SpritePool.getInstance().get(spriteName);
            }
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
    console.log('mouseup', e.data.global.x, e.data.global.y, e);

    const clickOffsetH = e.data.global.x - centerH;
    const clickOffsetV = e.data.global.y - centerV;
    console.log('offsets[px; 2d]', clickOffsetH, clickOffsetV);

// offsetH = (x - y) / 2 * (2 * innerRadius + 1 + CELL_BORDER)
// offsetV = z * (1.5 * outerRadius + 1 + CELL_BORDER * Math.sqrt(3) / 2)

// local2dXOffset = offset from cell center in 2d-coord
// local2dYOffset = offset from cell center in 2d-coord

// clickOffsetV = cellOffsetV + local2dYoffset
//              = z * (1.5 * outerRadius + 1 + CELL_BORDER * Math.sqrt(3) / 2) + local2dYoffset
// =>
// z = (clickOffsetV - local2dYoffset) / (1.5 * outerRadius + 1 + CELL_BORDER * Math.sqrt(3) / 2)
//   = clickOffsetV / (1.5 * outerRadius + 1 + CELL_BORDER * Math.sqrt(3) / 2) - local2dYoffset / (1.5 * outerRadius + 1 + CELL_BORDER * Math.sqrt(3) / 2)
// may be slightly less or mode than (clickOffsetV / (1.5 * outerRadius + 1 + CELL_BORDER * Math.sqrt(3) / 2))
// depending on local2dYoffset sign
// => we use Math.round
// z = Math.round(clickOffsetV / (1.5 * outerRadius + 1 + CELL_BORDER * Math.sqrt(3) / 2))

    const clickOffsetZcNotRounded = Math.abs(clickOffsetV) / (1.5 * outerRadius + 1 + CELL_BORDER * Math.sqrt(3) / 2);
    const clickOffsetZc = Math.sign(clickOffsetV) * Math.round(clickOffsetZcNotRounded);

// clickOffsetH = cellOffsetH + local2dXoffset
//              = (x - y) / 2 * (2 * innerRadius + 1 + CELL_BORDER) + local2dXoffset
//              = (x - (- x - z)) / 2 * (2 * innerRadius + 1 + CELL_BORDER) + local2dXoffset
//              = (2x + z) / 2 * (2 * innerRadius + 1 + CELL_BORDER) + local2dXoffset
//              = (x + z / 2) * (2 * innerRadius + 1 + CELL_BORDER) + local2dXoffset
//              = x * (2 * innerRadius + 1 + CELL_BORDER) + z * (2 * innerRadius + 1 + CELL_BORDER) / 2 + local2dXoffset
// =>
// x = (clickOffsetH - z * (2 * innerRadius + 1 + CELL_BORDER) / 2 - local2dXoffset) / (2 * innerRadius + 1 + CELL_BORDER)
//   = clickOffsetH / (2 * innerRadius + 1 + CELL_BORDER) + - / 2 - local2dXoffset / (2 * innerRadius + 1 + CELL_BORDER)
// may be slightly less or mode than clickOffsetH / (2 * innerRadius + 1 + CELL_BORDER) - z / 2
// depending on local2dXoffset sign
// => we use Math.round

    const clickOffsetXcNotRounded = Math.abs(clickOffsetH) / (2 * innerRadius + 1 + CELL_BORDER) - Math.sign(clickOffsetH) * clickOffsetZc / 2;
    const clickOffsetXc = Math.sign(clickOffsetH) * Math.round(clickOffsetXcNotRounded);

    const clickOffsetYc = 0 - clickOffsetXc - clickOffsetZc;

    console.log('offsets[for x,z; c; not rounded]', clickOffsetXcNotRounded, clickOffsetZcNotRounded);
    console.log('offsets[c]', clickOffsetXc, clickOffsetYc, clickOffsetZc);

    setTimeout(() => {
      window.onCellClick([pageData.x,pageData.y,pageData.z], [clickOffsetXc, clickOffsetYc, clickOffsetZc]);
    }, 10);
  });

  pageCtr.position.set(centerH, centerV);

  while(viewport.children[0]) { 
    viewport.removeChild(viewport.children[0]);
  }
  viewport.addChild(pageCtr);
};

export { draw };
