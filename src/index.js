import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import Field from './models/field.js';

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new PIXI.Application({
  width: window.innerWidth,         // default: 800
  height: window.innerHeight,        // default: 600
  antialias: true,    // default: false
  transparent: false, // default: false
  resolution: 1       // default: 1
});

app.renderer.backgroundColor = 0xfafafa;

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

const maxScreenSize = 3000.0;
const worldOuterRadiusPx = maxScreenSize / 2.0 * (1.0 + 1.0 / Math.sqrt(3));
const worldSize = 2 * worldOuterRadiusPx;
const cellOuterRadiusPx = 10.0;
const worldOuterRadiusC = Math.floor(worldOuterRadiusPx / cellOuterRadiusPx); 

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

window.field = new Field(worldOuterRadiusC);
window.field.fillWithRandom();

app.loader.add('ant.png')
  .load(() => {
    console.log('loaded');
    console.log(app.loader.resources['ant.png'].texture);
    window.field.draw(app, viewport, cellOuterRadiusPx);
  });
