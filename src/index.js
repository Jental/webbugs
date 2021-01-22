import * as pixi from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import Field from './models/field.js';
import HashMapField from './models/hashmap_field.js';
import { draw } from './draw_field.js';
import * as EmptyCellTexture from './textures/empty_cell.js';
import * as BugCellTexture from './textures/bug_cell.js';
import * as WallCellTexture from './textures/wall_cell.js';
import SpritePool from './sprite_pool.js';
import { TEXTURE_EMPTY, TEXTURE_BUG, TEXTURE_WALL } from './const.js';
import { fieldRandom, fieldFullScreenRandom, fieldForBorderCopyTest } from './test/fields.js';


// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new pixi.Application({
  width: window.innerWidth,         // default: 800
  height: window.innerHeight,        // default: 600
  // antialias: true,    // default: false
  transparent: false, // default: false
  resolution: 1       // default: 1
});

app.renderer.backgroundColor = 0xfafafa;

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

// const maxScreenSize = 3000.0;
const maxScreenSize = 100.0;
const worldOuterRadiusPx = maxScreenSize / 2.0 * (1.0 + 1.0 / Math.sqrt(3));
const worldSize = 2 * worldOuterRadiusPx;
const cellOuterRadiusPx = 10.0;

// create viewport
const viewport = new Viewport({
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  worldWidth: worldSize,
  worldHeight: worldSize,

  interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
});

// add the viewport to the stage
app.stage.addChild(viewport);

window.app = app;

// activate plugins
viewport
  .drag()
  .pinch()
  .wheel()
  .decelerate();

// const fieldData = fieldRandom();
// const fieldData = fieldFullScreenRandom(worldOuterRadiusPx, cellOuterRadiusPx);
const fieldData = fieldForBorderCopyTest();
window.field = fieldData.field;
const pageRadius = fieldData.pageRadius;

window.check = (x,y,z) => window.field.get(0,0,0).isActive(x,y,z);

window.redraw = () => {
  draw(window.field, app, viewport, pageRadius, cellOuterRadiusPx);
};

app.loader
  .add('ant.png')
  .load(() => {
    console.log('textures loaded');

    const namedTextures = {};
    namedTextures[TEXTURE_EMPTY] = EmptyCellTexture.create(app.renderer, cellOuterRadiusPx);
    namedTextures[TEXTURE_BUG] = BugCellTexture.create(app.renderer, cellOuterRadiusPx);
    namedTextures[TEXTURE_WALL] = WallCellTexture.create(app.renderer, cellOuterRadiusPx);
    new SpritePool(namedTextures, 1000);

    window.redraw();
  });
