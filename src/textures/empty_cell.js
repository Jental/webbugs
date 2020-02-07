import * as pixi from 'pixi.js';

const create = (renderer, outerRadius) => {
  const innerRadius = outerRadius * Math.sqrt(3) / 2.0;

  // const texture = pixi.RenderTexture.create(innerRadius * 2 + 1, outerRadius * 2 + 1);
  const textureSize = Math.pow(2, Math.floor(Math.log(outerRadius * 2.0) / Math.log(2)) + 1); // Textures are recommended to be 2^-sized and square
  const texture = pixi.RenderTexture.create(textureSize, textureSize);

  const centerH = innerRadius + 1;
  const centerV = outerRadius + 1;

  const graphics = new pixi.Graphics();

  graphics.lineStyle(1, 0xD0D0D0, 1);

  const path = [
    centerH - innerRadius, centerV + outerRadius / 2.0,
    centerH - innerRadius, centerV - outerRadius / 2.0,
    centerH, centerV - outerRadius,
    centerH + innerRadius, centerV - outerRadius / 2.0,
    centerH + innerRadius, centerV + outerRadius / 2.0,
    centerH, centerV + outerRadius,
    centerH - innerRadius, centerV + outerRadius / 2.0
  ];
  graphics.drawPolygon(path);

  renderer.render(graphics, texture);

  return texture;
};

export { create };
