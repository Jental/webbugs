import { Express } from 'express';
const express = require('express');
import * as path from 'path';
import * as http from 'http';
import * as socketio from 'socket.io';
const io = require('socket.io');
import { v4 as uuid } from 'uuid';

import { MessageType } from '../../webbugs-common/src/contract/message_type';
import { DataContract } from '../../webbugs-common/src/contract/data_contract'; 

import { emptyField, fieldForWallConnectionTest } from './test/fields';
import { Field } from '../../webbugs-common/src/models/field';
import { Component } from '../../webbugs-common/src/models/component';
import { ClickContract } from '../../webbugs-common/src/contract/click_contract';
import { FieldReducer } from './handlers';
import { ClickEvent, SetBugEvent, Event, SetWallEvent } from '../../webbugs-common/src/models/events';
import { MetadataContract } from '../../webbugs-common/src/contract/metadata_contract';
import { Coordinates } from '../../webbugs-common/src/models/coordinates';
import { RandomAI } from './ai/random'
import { EatAI } from './ai/eat';
import { combineLatest, Subject, timer, zip } from 'rxjs';
import { distinctUntilChanged, scan, map, delay } from 'rxjs/operators';
import _ from 'lodash';
import { Settings } from './settings';
import { EatNcAI } from './ai/eat_nc';

const PORT = process.env.PORT || Settings.Port;
const STATIC_PATH = path.join(__dirname, '../../../../webbugs-client/dist/');

let connectedClients : any[] = [];
let playerIDs : string[] = [];
let field : Field = null;
let components: Record<string, Component> = {}
let reducer: FieldReducer = null;
let socket : socketio.Server = null;

const events$ : Subject<Event> = new Subject();
const timer$ = timer(0, Settings.EventCollectInterval);
const eventsGroupedByTime$ = combineLatest([timer$, events$.pipe(delay(10))])
.pipe(
  scan(
    (acc : { tick: number, acc : Event[], events : Event[] }, value: [ number, Event ]) =>
      acc.tick >= value[0]
      ? { tick: acc.tick, acc: [...acc.acc, value[1]], events: [] }
      : { tick: value[0], acc: [ ], events: acc.acc },
    { tick: 0, acc: [], events: [] }
  ),
  distinctUntilChanged((x, y) => x.tick === y.tick),
  map(d => ({ tick: d.tick, events: d.events }))
);

eventsGroupedByTime$
.subscribe(({tick, events}) => {
  if (events.length > 0) {
    // @ts-ignore
    console.log('event group:', tick, events.length, events.map(e => [e.type, e.playerID]));
    reducer.handleA(events);
  }
});

const onFieldUpdate = () => {
  if (socket && connectedClients.length > 0) {
    const data: DataContract = {
      field: field,
      components: components
    }

    socket.sockets.emit(MessageType.Data, data);
  }
}

const onConnect = (client: socketio.Socket) => {
  const newPlayerID = uuid();
  playerIDs.push(newPlayerID);
  const metadata : MetadataContract = {
    playerID: newPlayerID,
    playerIDs: playerIDs
  };
  client.emit(MessageType.Metadata, metadata);

  const data: DataContract = {
    field: field,
    components: components
  }
  client.emit(MessageType.Data, data);

  const pageP : Coordinates = {x:0, y:0, z:0};
  field.get(pageP)
  .getRandomEmptyCellCoordinates()
  .then((p: Coordinates) => {
    events$.next(new SetBugEvent({page: pageP, cell: p}, newPlayerID, true));
  })
}

const onClick = (data: ClickContract) => {
  console.log('onClick', data);
  if (reducer) {
    events$.next(new ClickEvent(data.p, data.playerID));
  }
}

const removePlayer = (playerID: string): void => {
  playerIDs.splice(playerIDs.indexOf(playerID));
  const pageP : Coordinates = {x:0, y:0, z:0};
  field.get(pageP).removePlayer(playerID);
}

const reCreateField = () => {
  // const fieldData = fieldForWallConnectionTest(onFieldUpdate);
  const fieldData = emptyField(onFieldUpdate);
  field = fieldData.field;
  components = fieldData.components;
  reducer = fieldData.reducer;
  playerIDs = Object.keys(Settings.AIs);

  const pageP : Coordinates = {x: 0, y: 0, z: 0};
  for (const playerID of playerIDs) {
    field.get(pageP)
    .getRandomEmptyCellCoordinates()
    .then((p: Coordinates) => {
      const event = new SetBugEvent({page: pageP, cell: p}, playerID, true);
      events$.next(event);
    })
  }

  setTimeout(recreateAI, 5000);
}

let aiInterval = null;
const recreateAI = () => {
  if (aiInterval) {
    clearInterval(aiInterval);
  }
  const ais =
    _.chain(Settings.AIs)
     .map((v,k) => {
       if (!v) {
         return null;
       }
       else {
         switch (v) {
           case 'RandomAI':
             return new RandomAI(field, components, k);
           case 'EatAI':
             return new EatAI(field, components, k);
            case 'EatNcAI':
            return new EatNcAI(field, components, k);
           default:
             return null;
         }
       }
     })
     .filter(r => r !== null)
     .value();

  aiInterval = setInterval(() => {
    const nexts = ais.map(ai => ({
      playerID: ai.playerID,
      event: ai.next()
    }));
    const events : Event[] =
      nexts
      .filter(r => !r.event.done && r.event.value)
      .map(r => r.event.value);
    
    if(events.length === 0) {
      clearInterval(aiInterval);
      aiInterval = null;
    }
    else {
      for (const e of events) {
        events$.next(e);
      }
    }
  }, Settings.AISpeed);
}

const onReset = () => {
  console.log('Reset');
  reCreateField();
}

reCreateField();

let setCORS = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
};

const expressI : Express = express();
const httpServer : http.Server =
  expressI
  .use(express.static(STATIC_PATH))
  .use((req, res, next) => {
    setCORS(res);
    next();
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

socket = io(httpServer);
socket.on('connection', (client : socketio.Socket) => {
  console.log('connection');
  connectedClients.push(client);

  client.on('disconnect', () => {
    connectedClients.splice(connectedClients.indexOf(client), 1);
  });

  client.on(MessageType.Click, onClick);
  client.on(MessageType.Reset, onReset);

  onConnect(client);
});
console.log('path for static: ', STATIC_PATH);
