import * as pixi from 'pixi.js';

const create = (renderer: pixi.Renderer, outerRadius: number, playerID: number) => {
  const innerRadiusRaw = outerRadius * Math.sqrt(3) / 2.0;
  const innerRadius = Math.ceil(innerRadiusRaw);

  const texture = pixi.RenderTexture.create({ width: innerRadius * 2 + 1, height: outerRadius * 2 + 1 });
  // const textureSize = Math.pow(2, Math.floor(Math.log(outerRadius * 2.0) / Math.log(2)) + 1); // Textures are recommended to be 2^-sized and square
  // const texture = pixi.RenderTexture.create(textureSize, textureSize);
  const textureName = `ant${playerID}.png`;
  console.log('ant texture:', textureName);
  const antTexture = pixi.utils.TextureCache[textureName];

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

  const ant = new pixi.Sprite(antTexture);
  ant.x = centerH - innerRadius + 1;
  ant.y = centerV - innerRadius + 1;
  const size = Math.pow(2, Math.floor(Math.log(innerRadiusRaw * 2.0) / Math.log(2)));
  ant.width = size;
  ant.height = size;

  let ctr = new pixi.Container();
  ctr.addChild(graphics);
  ctr.addChild(ant);
  renderer.render(ctr, texture);

  return texture;
};

export { create };
