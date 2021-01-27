import * as _ from 'lodash';

export class FieldReducer {  
  constructor(field, onFieldUpdate) {
    this.field = field;
    this.onFieldUpdate = onFieldUpdate;
  }

  handle(event) {
    this.handleA([ event ]);
  }

  handleA(events) {
    const processResult = this.processEvents(events);

    if (processResult.updates && processResult.updates.length > 0) {
      this.applyUpdates(processResult.updates);
    }

    if (processResult.events && processResult.events.length > 0) {
      setTimeout(() => { this.handle(processResult.events); }, 100);
    }

    this.onFieldUpdate();
  }

  processEvents(events) {
    const result = _
          .chain(events)
          .map(event => { const result = this.processEvent(event); return [ result.events, result.updates ]; })
          .unzip()
          .map(_.flatten)
          .value();

    console.log('events: process result:', result);
    
    return {
      events: result[0],
      updates: result[1]
    };
  }

  // event: {
  //   type,
  //   page : {x, y, z},
  //   cell : {x, y, z},
  //   value: {type, playerID, data}
  // }
  // => {
  //   events : [],
  //   updates: [ update~see_applyUpdates ]
  // }
  processEvent(event) {
    console.log('events: event:', event);
    switch (event.type) {
    case 'set_bug':
      return {
        events: [],
        updates: [{
          page: event.page,
          cell: event.cell,
          value: {
            type: 'bug',
            playerID: event.playerID
          }
        }]
      };
    case 'set_wall':
      return {
        events: [],
        updates: [{
          page: event.page,
          cell: event.cell,
          value: {
            type: 'wall',
            playerID: event.playerID
          }
        }]
      };
    case 'set_wall_active':
      return {
        events: [],
        updates: [{
          page: event.page,
          cell: event.cell,
          value: {
            data: { active: true }
          }
        }]
      };
    case 'set_wall_inactive':
      return {
        events: [],
        updates: [{
          page: event.page,
          cell: event.cell,
          value: {
            data: { active: false }
          }
        }]
      };
    case 'add_wall_to_component':
      return { events: [], updates: [] };
    case 'remove_wall_from_component':
      return { events: [], updates: [] };
    default:
      return { events: [], updates: [] };
    }
  }

  // updates: [{
  //   page : {x, y, z},
  //   cell : {x, y, z},
  //   value: {type, playerID, data}
  // }]
  // => void
  applyUpdates(updates) {
    for (const update of updates) {
      console.log('events: update:', update);
      const page = this.field.get(update.page.x, update.page.y, update.page.z);
      if (page) {
        const value = page.get(update.cell.x, update.cell.y, update.cell.z);
        page.set(
          update.cell.x, update.cell.y, update.cell.z,
          update.value.type ? update.value.type : (value ? value.type : null),
          update.value.playerID !== null && update.value.playerID !== undefined ? update.value.playerID : (value ? value.playerID : null),
          value ? {...value.data, ...update.value.data} : update.value.data
        );
      }
    }
  }
}


export const setCell = ([pageX,pageY,pageZ], [x,y,z], field, newValue) => {
  const page = field.get(pageX,pageY,pageZ);
  if (page) {
    const oldValue = page.get(x,y,z);
    console.log(pageX,pageY,pageZ, '|', x,y,z, '|', oldValue, '->', newValue);

    page.set(x,y,z, newValue.type, newValue.playerID, newValue);

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
