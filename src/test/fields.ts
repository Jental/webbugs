import { Field } from '../models/field';
import { setCell } from '../handlers';
import { Coordinates } from '../models/coordinates';
import { CellType } from '../models/cell';

const fillPageWithRandom = (field : Field, pageP: Coordinates) : void =>  {
  const page = field.get(pageP);
  for (let x = - page.radius + 1; x < page.radius - 1; x++) {
    for (let y = - page.radius + 1; y < page.radius - 1; y++) {
      const z = 0 - x - y;
      if (z < page.radius) {
        const rndVal = Math.random() * 10.0;
        if (rndVal >= 8.0 && rndVal < 9.0) {
          setCell(
            { page: pageP, cell: {x,y,z}},
            field, 
            {
              type: CellType.Bug,
              playerID : 1
            });
        }
        else if (rndVal >= 9.0 && rndVal < 10.0) {
          setCell(
            { page: pageP, cell: {x,y,z}},
            field, 
            {
              type: CellType.Wall,
              playerID : 1
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

  fillPageWithRandom(field, { x: 0, y: 0, z: 0 });

  return { field, pageRadius };
};

export const fieldSingleRandom = () => {
  const pageRadius = 10;  
  const field = new Field(pageRadius);

  fillPageWithRandom(field, { x: 0, y: 0, z: 0 });

  return { field, pageRadius };
};

export const fieldFullScreenRandom = (worldOuterRadiusPx, cellOuterRadiusPx) => {
  const pageRadius = Math.floor(worldOuterRadiusPx / cellOuterRadiusPx);
  const field = new Field(pageRadius);

  fillPageWithRandom(field, { x: 0, y: 0, z: 0 });

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

  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 0, y: 4, z: -4 }},
    field,
    {
      type: CellType.Bug,
      playerID : 1
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 4, y: 0, z: -4 }},
    field,
    {
      type: CellType.Wall,
      playerID : 1
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 4, y: -4, z: 0 }},
    field,
    {
      type: CellType.Bug,
      playerID : 1
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 0, y: -4, z: 4 }},
    field,
    {
      type: CellType.Wall,
      playerID : 1
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: -4, y: 0, z: 4 }},
    field,
    {
      type: CellType.Bug,
      playerID : 1
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: -4, y: 4, z: 0 }},
    field,
    {
      type: CellType.Wall,
      playerID : 1
    });

  return { field, pageRadius };
};

export const fieldForWallConnectionTest = () => {
  const pageRadius = 10;
  const field = new Field(pageRadius);

  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 0, y: 0, z: 0 }},
    field,
    {
      type: CellType.Bug,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 4, y: 1, z: -5 }},
    field,
    {
      type: CellType.Bug,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 0, y: -4, z: 4 }},
    field,
    {
      type: CellType.Bug,
      playerID : 1
    });

  // First wall component
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 0, y: 1, z: -1 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 0, y: 2, z: -2 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 0, y: 3, z: -3 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 0, y: 4, z: -4 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 1, y: 3, z: -4 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 2, y: 2, z: -4 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 3, y: 1, z: -4 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 3, y: 0, z: -3 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 2, y: 0, z: -2 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 1, y: 1, z: -2 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });

  // Second wall component
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 1, y: -1, z: 0 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 0, y: -2, z: 2 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 0, y: -3, z: 3 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 1, y: -3, z: 2 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: 1, y: -2, z: 1 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });

  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: -1, y: 0, z: 1 }},
    field,
    {
      type: CellType.Wall,
      playerID : 1,
      isActive: false
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: -2, y: 0, z: 2 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0
    });
  setCell(
    { page: {x: 0, y: 0, z: 0 }, cell: { x: -3, y: 0, z: 3 }},
    field,
    {
      type: CellType.Wall,
      playerID : 0,
      isActive: false
    });

  return { field, pageRadius };
};