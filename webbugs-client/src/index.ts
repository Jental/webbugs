import { Observable, fromEvent, from, combineLatest } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { io } from 'socket.io-client';

import { Field } from '../../webbugs-common/src/models/field';
import { Component } from '../../webbugs-common/src/models/component';
import { MessageType } from '../../webbugs-common/src/contract/message_type';
import { DataContract } from '../../webbugs-common/src/contract/data_contract';
import { MetadataContract } from '../../webbugs-common/src/contract/metadata_contract';
import { ClickContract } from '../../webbugs-common/src/contract/click_contract';
import { FullCoordinates } from '../../webbugs-common/src/models/coordinates';

import { createPixiApp } from './pixi_app';
import { COLORS } from './const';

// const maxScreenSize = 3000.0;
const maxScreenSize = 100.0;
const cellOuterRadiusPx = 10.0;

interface Store {
  field$: Observable<Field>;
  components$: Observable<Record<string, Component>>;
}
const store : Store = {
  field$: null,
  components$: null,
};

const socket = io('http://localhost:5000');

let playerID = null;

document.addEventListener("keydown", event => {
  if (event.key == '0' || event.key == '1') {
    const radio = document.querySelector(`input[type="radio"][name="active-player"][value="${event.key}"]`);
    if (radio) {
      // @ts-ignore
      radio.checked = true;
    }
    playerID = event.key;
  } 
});
document.getElementById('reset-btn').addEventListener("click", event => {
  socket.emit(MessageType.Reset);
});

const onCellClick = (p: FullCoordinates) => {
  const playerRadioButton : HTMLInputElement = document.querySelector('input[type="radio"][name="active-player"]:checked');
  if (playerRadioButton) {
    playerID = playerRadioButton.value;
  }

  const data: ClickContract = {
    p,
    playerID
  }
  socket.emit(MessageType.Click, data);
};

const metadataEvent$ : Observable<MetadataContract> = fromEvent<MetadataContract>(socket, MessageType.Metadata);

const pixiInit$ = from(createPixiApp(
  maxScreenSize,
  cellOuterRadiusPx,
  metadataEvent$.pipe(map(data => data.playerIDs)),
  onCellClick
));

const dataEvent$ : Observable<DataContract> = fromEvent<DataContract>(socket, MessageType.Data);
store.field$ = dataEvent$.pipe(
  filter(data => !!data.field),
  map(data => Field.fromObject(data.field))
);
store.components$ = dataEvent$.pipe(
  filter(data => !!data.components),
  map(data => data.components)
);

metadataEvent$.subscribe((data) => {
  console.log('metadata update', data);
  playerID = data.playerID;
  if (!(playerID in COLORS)) {
    COLORS[playerID] = Math.floor(Math.random() * 2**24);
  }
});
dataEvent$.subscribe(() => { console.log('update from server'); });
store.field$.subscribe(() => { console.log('field update'); });
store.components$.subscribe(() => { console.log('components update'); });
pixiInit$.subscribe(() => { console.log('pixi initialized'); });

combineLatest([pixiInit$, store.field$, store.components$])
.subscribe(([pixiInitData, field, components]) => {
  // @ts-ignore
  window.field = field; window.components = components;

  pixiInitData.drawFn(field, components);
});