import Field from '../models/field.js';
import { setCell } from '../handlers.js';

const fillPageWithRandom = (field, [pageX,pageY,pageZ]) =>  {
  const page = field.get(pageX,pageY,pageZ);
  for (let x = - page.radius + 1; x < page.radius - 1; x++) {
    for (let y = - page.radius + 1; y < page.radius - 1; y++) {
      const z = 0 - x - y;
      if (z < page.radius) {
        const rndVal = Math.random() * 10.0;
        if (rndVal >= 8.0 && rndVal < 9.0) {
          setCell([pageX,pageY,pageZ], [x,y,z], field, {
            type: 'bug',
            playerID : 1
          });
        }
        else if (rndVal >= 9.0 && rndVal < 10.0) {
          setCell([pageX,pageY,pageZ], [x,y,z], field, {
            type: 'wall',
            playerID : 1,
            bugID: 0
          });
        }
      }
    }
  }
};

export const fieldRandom = (pageRadius) => {
  const field = new Field(pageRadius);

  field.addPageTopRight(0);
  field.addPageTop(0);
  field.addPageTopLeft(0);
  field.addPageBottomLeft(0);
  field.addPageBottom(0);
  field.addPageBottomRight(0);
  field.addPageBottomRight(1);
  field.addPageTopLeft(1);
  field.addPageBottomLeft(1);
  field.addPageTopRight(1);
  field.addPageTop(1);
  field.addPageBottom(1);

  fillPageWithRandom(field, [0,0,0]);

  return field;
};

export const fieldForBorderCopyTest = (worldOuterRadiusC) => {
}
