import * as pixi from 'pixi.js';
import { COLORS } from '../const.js';

const create = (renderer, outerRadius, playerID, isActive) => {
  const innerRadiusRaw = outerRadius * Math.sqrt(3) / 2.0;
  const innerRadius = Math.ceil(innerRadiusRaw);

  const texture = pixi.RenderTexture.create(innerRadius * 2 + 1, outerRadius * 2 + 1);
  // const textureSize = Math.pow(2, Math.floor(Math.log(outerRadius * 2.0) / Math.log(2)) + 1); // Textures are recommended to be 2^-sized and square
  // const texture = pixi.RenderTexture.create(textureSize, textureSize);
  const antTexture = pixi.utils.TextureCache['ant.png'];

  const centerH = innerRadius + 1;
  const centerV = outerRadius + 1;

  const graphics = new pixi.Graphics();

  const color = COLORS[playerID];
  graphics.lineStyle(1, color, 1);
  if (isActive) {
    graphics.beginFill(color);
  }
  else {
    graphics.beginFill(color, 0.5);
  }

  const path = [
    centerH - innerRadiusRaw, centerV + outerRadius / 2.0,
    centerH - innerRadiusRaw, centerV - outerRadius / 2.0,
    centerH, centerV - outerRadius,
    centerH + innerRadiusRaw, centerV - outerRadius / 2.0,
    centerH + innerRadiusRaw, centerV + outerRadius / 2.0,
    centerH, centerV + outerRadius,
    centerH - innerRadiusRaw, centerV + outerRadius / 2.0
  ];
  graphics.drawPolygon(path);
  graphics.endFill();

  renderer.render(graphics, texture);

  return texture;
};

export { create };
