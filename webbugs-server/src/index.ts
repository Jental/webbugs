import { Express } from 'express';
const express = require('express');
import * as path from 'path';
import * as http from 'http';
import * as socketio from 'socket.io';
const io = require('socket.io');
import { v4 as uuid } from 'uuid';

import { MessageType } from '../../webbugs-common/src/contract/message_type';
import { DataContract } from '../../webbugs-common/src/contract/data_contract'; 

import { fieldForWallConnectionTest } from './test/fields';
import { Field } from '../../webbugs-common/src/models/field';
import { Component } from '../../webbugs-common/src/models/component';
import { ClickContract } from '../../webbugs-common/src/contract/click_contract';
import { FieldReducer } from './handlers';
import { ClickEvent, SetBugEvent } from '../../webbugs-common/src/models/events';
import { MetadataContract } from '../../webbugs-common/src/contract/metadata_contract';
import { Coordinates } from '../../webbugs-common/src/models/coordinates';

const PORT = process.env.PORT || 5000;
const STATIC_PATH = path.join(__dirname, '../../../../webbugs-client/dist/');

let connectedClients : any[] = [];
let playerIDs : string[] = [];
let field : Field = null;
let components: Record<string, Component> = {}
let reducer: FieldReducer = null;
let socket : socketio.Server = null;

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
    reducer.handle(new SetBugEvent({page: pageP, cell: p}, newPlayerID));
  })
}

const onClick = (data: ClickContract) => {
  if (reducer) {
    reducer.handle(new ClickEvent(data.p, data.playerID));
  }
}

const reCreateField = () => {
  const fieldData = fieldForWallConnectionTest(onFieldUpdate);
  field = fieldData.field;
  components = fieldData.components;
  reducer = fieldData.reducer;
  playerIDs = ['0', '1'];
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
  console.log('connection', client);
  connectedClients.push(client);

  client.on('disconnect', () => {
    connectedClients.splice(connectedClients.indexOf(client), 1);
  });

  client.on(MessageType.Click, onClick);
  client.on(MessageType.Reset, onReset);

  onConnect(client);
});
// socket.listen(WS_PORT);
console.log('path for static: ', STATIC_PATH);
