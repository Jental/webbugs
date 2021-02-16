import * as pixi from 'pixi.js';
import { ColorReplaceFilter } from 'pixi-filters';
import { COLORS } from '../const';

const create = (renderer: pixi.Renderer, outerRadius: number, playerID: string, isBase: boolean) => {
  const innerRadiusRaw = outerRadius * Math.sqrt(3) / 2.0;
  const innerRadius = Math.ceil(innerRadiusRaw);

  const texture = pixi.RenderTexture.create({ width: innerRadius * 2 + 1, height: outerRadius * 2 + 1 });
  // const textureSize = Math.pow(2, Math.floor(Math.log(outerRadius * 2.0) / Math.log(2)) + 1); // Textures are recommended to be 2^-sized and square
  // const texture = pixi.RenderTexture.create(textureSize, textureSize);
  // const textureName = `ant${playerID}.png`;
  const textureName = 'ant.png';
  const antTexture = pixi.utils.TextureCache[textureName];
  const color = COLORS[playerID];

  const centerH = innerRadius + 1;
  const centerV = outerRadius + 1;

  const graphics = new pixi.Graphics();

  graphics.lineStyle(1, 0xD0D0D0, 1);

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

  if (isBase) {
    const width = 2;
    const offset = width + 1;

    graphics.lineStyle(width, color, 1);

    const path = [
      centerH - innerRadiusRaw + offset, centerV + outerRadius / 2.0,
      centerH - innerRadiusRaw + offset, centerV - outerRadius / 2.0,
      centerH, centerV - outerRadius + offset,
      centerH + innerRadiusRaw - offset, centerV - outerRadius / 2.0,
      centerH + innerRadiusRaw - offset, centerV + outerRadius / 2.0,
      centerH, centerV + outerRadius - offset,
      centerH - innerRadiusRaw + offset, centerV + outerRadius / 2.0
    ];
    graphics.drawPolygon(path);
  }

  const ant = new pixi.Sprite(antTexture);
  ant.x = centerH - innerRadius + 1;
  ant.y = centerV - innerRadius + 1;
  const size = Math.pow(2, Math.floor(Math.log(innerRadiusRaw * 2.0) / Math.log(2)));
  ant.width = size;
  ant.height = size;

  const filter = new ColorReplaceFilter(0x000000, color, 0.1);
  ant.filters = [filter];

  let ctr = new pixi.Container();
  ctr.addChild(graphics);
  ctr.addChild(ant);
  renderer.render(ctr, texture);

  return texture;
};

export { create };
