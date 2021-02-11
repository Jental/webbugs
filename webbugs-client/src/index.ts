import { io } from 'socket.io-client';
import { Observable, of } from 'rxjs';

import { FullCoordinates } from '../../webbugs-common/src/models/coordinates';
import { Field } from '../../webbugs-common/src/models/field';
import { Component } from '../../webbugs-common/src/models/component';
import { MessageType } from '../../webbugs-common/src/contract/message_type';
import { DataContract } from '../../webbugs-common/src/contract/data_contract';

import { createPixiApp } from './pixi_app';


// const maxScreenSize = 3000.0;
const maxScreenSize = 100.0;
const cellOuterRadiusPx = 10.0;

interface Store {
  field: Observable<Field>;
  components: Observable<Record<string, Component>>;
}
const store : Store = {
  field: of(null),
  components: of({})
};

document.addEventListener("keydown", event => {
  if (event.key == '0' || event.key == '1') {
    const radio = document.querySelector(`input[type="radio"][name="active-player"][value="${event.key}"]`);
    if (radio) {
      // @ts-ignore
      radio.checked = true;
    }
  } 
});

// const onCellClick = (fieldReducer: FieldReducer) => (p: FullCoordinates) => {
//   //@ts-ignore
//   const playerID = parseInt(document.querySelector('input[type="radio"][name="active-player"]:checked').value);
//   fieldReducer.handle(new ClickEvent(p, playerID));
// };
const onCellClick = () => {};

const redraw = (field, pageRadius, fieldReducer) => {
  if (initialized && drawFn) {
    drawFn(field);
  }
};

let initialized = false;
const onPixiInit = () => {
  initialized = true;
  // redraw(field, pageRadius, fieldReducer);
}

// @ts-ignore
window.field = field;
// @ts-ignore
window.components = components;

// const fieldReducer = new FieldReducer(field, components, redraw);

let drawFn = createPixiApp(maxScreenSize, cellOuterRadiusPx, onPixiInit, onCellClick);

const socket = io('http://localhost:5000');
socket.on(MessageType.Data, (data: DataContract) => {
  console.log('new data', data);
});