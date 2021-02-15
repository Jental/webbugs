import { Observable, fromEvent, from, combineLatest } from 'rxjs';
import { map, filter, withLatestFrom, mergeMap } from 'rxjs/operators';
import { io } from 'socket.io-client';

import { Field } from '../../webbugs-common/src/models/field';
import { Component } from '../../webbugs-common/src/models/component';
import { MessageType } from '../../webbugs-common/src/contract/message_type';
import { DataContract } from '../../webbugs-common/src/contract/data_contract';
import { ClickContract } from '../../webbugs-common/src/contract/click_contract';

import { createPixiApp } from './pixi_app';
import { FullCoordinates } from '../../webbugs-common/src/models/coordinates';


// const maxScreenSize = 3000.0;
const maxScreenSize = 100.0;
const cellOuterRadiusPx = 10.0;

interface Store {
  field$: Observable<Field>;
  field: Field,
  components$: Observable<Record<string, Component>>;
  components: Record<string, Component>
}
const store : Store = {
  field$: null,
  field: null,
  components$: null,
  components: null
};
// @ts-ignore
window.store = store;

const socket = io('http://localhost:5000');

document.addEventListener("keydown", event => {
  if (event.key == '0' || event.key == '1') {
    const radio = document.querySelector(`input[type="radio"][name="active-player"][value="${event.key}"]`);
    if (radio) {
      // @ts-ignore
      radio.checked = true;
    }
  } 
});

const onCellClick = (p: FullCoordinates) => {
  const playerRadioButton : HTMLInputElement = document.querySelector('input[type="radio"][name="active-player"]:checked');
  const playerID = parseInt(playerRadioButton.value);
  console.log('click', p, playerID);
  const data: ClickContract = {
    p,
    playerID
  }
  socket.emit(MessageType.Click, data);
};

// const redraw = (field: Field, components: Record<string, Component>) => {
//   console.log('redraw');
//   if (initialized && drawFn) {
//     drawFn(field, components);
//   }
//   else {
//     console.log('redraw: not yet initialized');
//   }
// };

const pixiInit$ = from(createPixiApp(maxScreenSize, cellOuterRadiusPx, onCellClick));

const dataEvent$ : Observable<DataContract> = fromEvent<DataContract>(socket, MessageType.Data);
store.field$ = dataEvent$.pipe(
  filter(data => !!data.field),
  map(data => Field.fromObject(data.field))
);
store.components$ = dataEvent$.pipe(
  filter(data => !!data.components),
  map(data => data.components)
);

dataEvent$.subscribe(() => { console.log('update from server'); });
store.field$.subscribe(() => { console.log('field update'); });
store.components$.subscribe(() => { console.log('components update'); });
pixiInit$.subscribe(() => { console.log('pixi initialized'); });

combineLatest([pixiInit$, store.field$, store.components$])
.subscribe(([pixiInitData, field, components]) => {
  pixiInitData.drawFn(field, components);
});