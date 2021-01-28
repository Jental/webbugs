import * as pixi from 'pixi.js';

let instance : SpritePool = null;

export default class SpritePool {
  sprites: Record<string, pixi.Sprite[]>;
  textures: Record<string, pixi.Texture>;

  constructor(namedTextures: Record<string, pixi.Texture>, size: number) {
    if (instance) {
      throw 'SpritePool already initialized';
    }
    
    this.sprites = {};
    this.textures = namedTextures;
    console.log('textures', this.textures);
    for (let name in namedTextures) {
      const texture = namedTextures[name];
      this.sprites[name] = Array.from({length:size}, (e, i)=> new pixi.Sprite(texture));
    }

    instance = this;
  }

  static getInstance() : SpritePool {
    if (!instance) {
      throw 'No SpritePool instance initialized';
    }

    return instance;
  }

  get(name: string) : pixi.Sprite {
    const ss = this.sprites[name];
    if (ss && ss.length > 0) {
      return ss.pop();
    }
    else {
      return new pixi.Sprite(this.textures[name]);
    }
  }

  release(name: string, sprite: pixi.Sprite) {
    const ss = this.sprites[name];
    ss.push(sprite);
  }
}
