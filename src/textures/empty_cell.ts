import * as pixi from 'pixi.js';

const create = (renderer: pixi.Renderer, outerRadius: number) => {
  const innerRadiusRaw = outerRadius * Math.sqrt(3) / 2.0;
  const innerRadius = Math.ceil(innerRadiusRaw);

  // const textureSize = Math.pow(2, Math.floor(Math.log(outerRadius * 2.0) / Math.log(2)) + 1); // Textures are recommended to be 2^-sized and square
  // const texture = pixi.RenderTexture.create(textureSize, textureSize);
  const texture = pixi.RenderTexture.create({ width: innerRadius * 2.0 + 1, height: outerRadius * 2.0 + 1 });

  const centerH = innerRadius + 1;
  const centerV = outerRadius + 1;

  const graphics = new pixi.Graphics();

  graphics.lineStyle(1, 0xD0D0D0, 1);

  // const pathRect = [
  //   1.0, 1.0,
  //   innerRadius * 2.0 + 1, 1.0,
  //   innerRadius * 2.0 + 1, outerRadius * 2.0 + 1,
  //   1.0, outerRadius * 2.0 + 1
  // ];
  // graphics.beginFill(0x23241f);
  // graphics.drawPolygon(pathRect);
  // graphics.endFill();

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

  renderer.render(graphics, texture);

  return texture;
};

export { create };
