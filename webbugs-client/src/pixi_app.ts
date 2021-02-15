import * as pixi from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { FullCoordinates } from '../../webbugs-common/src/models/coordinates';
import { draw } from './draw_field';
import { Field } from '../../webbugs-common/src/models/field';
import { TEXTURE_EMPTY, TEXTURE_BUG_0, TEXTURE_WALL_0, TEXTURE_BUG_1, TEXTURE_WALL_1 } from './const';
import * as EmptyCellTexture from './textures/empty_cell';
import * as BugCellTexture from './textures/bug_cell';
import * as WallCellTexture from './textures/wall_cell';
import SpritePool from './sprite_pool';
import { Component } from '../../webbugs-common/src/models/component';

export interface PixiInitResult {
  drawFn: (field: Field, components: Record<string, Component>) => void
}

export const createPixiApp = (
  maxScreenSize: number,
  cellOuterRadiusPx: number,
  onCellClick: (p: FullCoordinates) => void
) : Promise<PixiInitResult> => new Promise((resolve) => {
  const worldOuterRadiusPx = maxScreenSize / 2.0 * (1.0 + 1.0 / Math.sqrt(3));
  const pageRadius = Math.floor(maxScreenSize / cellOuterRadiusPx);

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

  // create viewport
  const worldSize = 2 * worldOuterRadiusPx;
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

  const drawFn = (field: Field, components: Record<string, Component>) => {
    console.log('draw');
    draw(field, components, viewport, pageRadius, cellOuterRadiusPx, onCellClick);
  }

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

    resolve({
      drawFn : drawFn
    });
  });
});