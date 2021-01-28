import * as pixi from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { draw } from './draw_field';
import * as EmptyCellTexture from './textures/empty_cell';
import * as BugCellTexture from './textures/bug_cell';
import * as WallCellTexture from './textures/wall_cell';
import SpritePool from './sprite_pool';
import { TEXTURE_EMPTY, TEXTURE_BUG_0, TEXTURE_WALL_0, TEXTURE_BUG_1, TEXTURE_WALL_1 } from './const';
import { fieldRandom, fieldSingleRandom, fieldFullScreenRandom, fieldForBorderCopyTest, fieldForWallConnectionTest } from './test/fields';
import { FieldReducer, EventType } from './handlers';
import { FullCoordinates } from './models/coordinates';


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

// activate plugins
viewport
  .drag()
  .pinch()
  .wheel()
  .decelerate();

// const fieldData = fieldRandom();
// const fieldData = fieldFullScreenRandom(worldOuterRadiusPx, cellOuterRadiusPx);
// const fieldData = fieldForBorderCopyTest();
// const fieldData = fieldSingleRandom();
const fieldData = fieldForWallConnectionTest();
const field = fieldData.field;
const pageRadius = fieldData.pageRadius;

//@ts-ignore
window.field = field;

const onCellClick = (p: FullCoordinates) => {
  //@ts-ignore
  const playerID = parseInt(document.querySelector('input[type="radio"][name="active-player"]:checked').value);
  // setCell([pageX,pageY,pageZ], [cellX,cellY,cellZ], field, {
  //   type: 'bug',
  //   playerID : 0
  // });
  fieldReducer.handle({
    type: EventType.SetBug,
    p: p,
    value: {
      playerID: playerID
    }
  });
};

const redraw = () => {
  draw(field, viewport, pageRadius, cellOuterRadiusPx, onCellClick);
};

const fieldReducer = new FieldReducer(field, redraw);

app.loader
  .add(['ant0.png', 'ant1.png'])
  .load(() => {
    console.log('textures loaded');

    const namedTextures = {};
    namedTextures[TEXTURE_EMPTY] = EmptyCellTexture.create(app.renderer, cellOuterRadiusPx);
    namedTextures[TEXTURE_BUG_0] = BugCellTexture.create(app.renderer, cellOuterRadiusPx, 0);
    namedTextures[TEXTURE_WALL_0] = WallCellTexture.create(app.renderer, cellOuterRadiusPx, 0, true);
    namedTextures[TEXTURE_WALL_0 + '_inactive'] = WallCellTexture.create(app.renderer, cellOuterRadiusPx, 0, false);
    namedTextures[TEXTURE_BUG_1] = BugCellTexture.create(app.renderer, cellOuterRadiusPx, 1);
    namedTextures[TEXTURE_WALL_1] = WallCellTexture.create(app.renderer, cellOuterRadiusPx, 1, true);
    namedTextures[TEXTURE_WALL_1 + '_inactive'] = WallCellTexture.create(app.renderer, cellOuterRadiusPx, 1, false);
    new SpritePool(namedTextures, 1000);

    redraw();
  });
