import * as pixi from 'pixi.js';

let instance : SpritePool = null;

export default class SpritePool {
  sprites: Record<string, pixi.Sprite[]> = {};
  textures: Record<string, pixi.Texture> = {};
  size: number;

  constructor(namedTextures: Record<string, pixi.Texture>, size: number) {
    if (instance) {
      throw 'SpritePool already initialized';
    }
    
    this.size = size;
    this.add(namedTextures);

    instance = this;
  }

  static getInstance() : SpritePool {
    if (!instance) {
      throw 'No SpritePool instance initialized';
    }

    return instance;
  }

  has(name: string) : boolean {
    return name in this.sprites;
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

  add(namedTextures: Record<string, pixi.Texture>) {
    this.textures = {
      ...this.textures,
      ...namedTextures
    };
    console.log('textures', this.textures);

    for (let name in namedTextures) {
      const texture = namedTextures[name];
      this.sprites[name] = Array.from({length:this.size}, (e, i)=> new pixi.Sprite(texture));
    }
  }

  release(name: string, sprite: pixi.Sprite) {
    const ss = this.sprites[name];
    ss.push(sprite);
  }
}
