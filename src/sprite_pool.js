import * as pixi from 'pixi.js';

let instance = null;

export default class SpritePool {
  constructor(namedTextures, size) {
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

  static getInstance() {
    if (!instance) {
      throw 'No SpritePool instance initialized';
    }

    return instance;
  }

  get(name) {
    const ss = this.sprites[name];
    if (ss && ss.length > 0) {
      return ss.pop();
    }
    else {
      return new pixi.Sprite(this.textures[name]);
    }
  }

  release(name, sprite) {
    const ss = this.sprites[name];
    ss.push(sprite);
  }
}
