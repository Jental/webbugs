export const setCell = ([pageX,pageY,pageZ], [x,y,z], field, newValue) => {
  const page = field.get(pageX,pageY,pageZ);
  if (page) {
    const oldValue = page.get(x,y,z);
    console.log(pageX,pageY,pageZ, '|', x,y,z, '|', oldValue, '->', newValue);

    page.set(x,y,z, newValue.type, newValue.playerID, newValue.data);

    handleBorderCell([pageX,pageY,pageZ], page, [x,y,z], field, newValue);
  }

  if (window.redraw) {
    window.redraw();
  }
};

const handleBorderCell = ([pageX,pageY,pageZ], page, [x,y,z], field, newValue) => {
  const isOnXTopBorder    = x === page.radius - 1;
  const isOnXBottomBorder = x === - page.radius + 1;
  const isOnYTopBorder    = y === page.radius - 1;
  const isOnYBottomBorder = y === - page.radius + 1;
  const isOnZTopBorder    = z === page.radius - 1;
  const isOnZBottomBorder = z === - page.radius + 1;
  if (isOnXTopBorder) {
    console.log('top-right border');
    const neighbour = field.getPageTopRight(pageY);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = - page.radius + 1;
      const ny = - z;
      const nz = - y;

      neighbour.page.set(nx,ny,nz, newValue.type, newValue.playerID, newValue.data);
    }
  }
  if (isOnXBottomBorder) {
    console.log('bottom-left border');
    const neighbour = field.getPageBottomLeft(pageY);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = page.radius - 1;
      const ny = - z;
      const nz = - y;

      neighbour.page.set(nx,ny,nz, newValue.type, newValue.playerID, newValue.data);
    }
  }
  if (isOnYTopBorder) {
    console.log('top-left border');
    const neighbour = field.getPageTopLeft(pageZ);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = - z;
      const ny = - page.radius + 1;
      const nz = - x;

      neighbour.page.set(nx,ny,nz, newValue.type, newValue.playerID, newValue.data);
    }
  }
  if (isOnYBottomBorder) {
    console.log('bottom-right border');
    const neighbour = field.getPageBottomRight(pageZ);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = - z;
      const ny = page.radius - 1;
      const nz = - x;

      neighbour.page.set(nx,ny,nz, newValue.type, newValue.playerID, newValue.data);
    }
  }
  if (isOnZTopBorder) {
    console.log('bottom border');
    const neighbour = field.getPageBottom(pageX);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = - y;
      const ny = - x;
      const nz = - page.radius + 1;

      neighbour.page.set(nx,ny,nz, newValue.type, newValue.playerID, newValue.data);
    }
  }
  if (isOnZBottomBorder) {
    console.log('top border');
    const neighbour = field.getPageTop(pageX);
    if (neighbour) {
      console.log('neighbour:', neighbour);

      const nx = - y;
      const ny = - x;
      const nz = page.radius - 1;

      neighbour.page.set(nx,ny,nz, newValue.type, newValue.playerID, newValue.data);
    }
  }

};
