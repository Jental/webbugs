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

export const fieldRandom = () => {
  const pageRadius = 10;
  
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

  return { field, pageRadius };
};

export const fieldSingleRandom = () => {
  const pageRadius = 10;  
  const field = new Field(pageRadius);

  fillPageWithRandom(field, [0,0,0]);

  return { field, pageRadius };
};

export const fieldFullScreenRandom = (worldOuterRadiusPx, cellOuterRadiusPx) => {
  const pageRadius = Math.floor(worldOuterRadiusPx / cellOuterRadiusPx);
  const field = new Field(pageRadius);

  fillPageWithRandom(field, [0,0,0]);

  return { field, pageRadius };
};

export const fieldForBorderCopyTest = () => {
  const pageRadius = 5;
  const field = new Field(pageRadius);

  field.addPageTopRight(0);
  field.addPageTop(0);
  field.addPageTopLeft(0);
  field.addPageBottomLeft(0);
  field.addPageBottom(0);
  field.addPageBottomRight(0);

  setCell([0,0,0], [0,4,-4], field, {
    type: 'bug',
    playerID : 1
  });
  setCell([0,0,0], [4,0,-4], field, {
    type: 'wall',
    playerID : 1,
    bugID: 0
  });
  setCell([0,0,0], [4,-4,0], field, {
    type: 'bug',
    playerID : 1
  });
  setCell([0,0,0], [0,-4,4], field, {
    type: 'wall',
    playerID : 1,
    bugID: 0
  });
  setCell([0,0,0], [-4,0,4], field, {
    type: 'bug',
    playerID : 1
  });
  setCell([0,0,0], [-4,4,0], field, {
    type: 'wall',
    playerID : 1,
    bugID: 0
  });

  return { field, pageRadius };
};

export const fieldForWallConnectionTest = () => {
  const pageRadius = 10;
  const field = new Field(pageRadius);

  setCell([0,0,0], [0,0,0], field, {
    type: 'bug',
    playerID : 0
  });
  setCell([0,0,0], [4,1,-5], field, {
    type: 'bug',
    playerID : 0
  });
  setCell([0,0,0], [0,-4,4], field, {
    type: 'bug',
    playerID : 1
  });

  // First wall component
  setCell([0,0,0], [0,1,-1], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [0,2,-2], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [0,3,-3], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [0,4,-4], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [1,3,-4], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [2,2,-4], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [3,1,-4], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [3,0,-3], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [2,0,-2], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [1,1,-2], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });

  // Second wall component
  setCell([0,0,0], [1,-1,0], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [0,-2,2], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [0,-3,3], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [1,-3,2], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [1,-2,1], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });

  setCell([0,0,0], [-1,0,1], field, {
    type: 'wall',
    playerID : 1,
    bugID: 0,
    isActive: false
  });
  setCell([0,0,0], [-2,0,2], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0
  });
  setCell([0,0,0], [-3,0,3], field, {
    type: 'wall',
    playerID : 0,
    bugID: 0,
    isActive: false
  });

  return { field, pageRadius };
};
