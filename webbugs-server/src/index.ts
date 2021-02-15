import { Express } from 'express';
const express = require('express');
import * as path from 'path';
import * as http from 'http';
import * as socketio from 'socket.io';
const io = require('socket.io');

import { MessageType } from '../../webbugs-common/src/contract/message_type';
import { DataContract } from '../../webbugs-common/src/contract/data_contract'; 

import { fieldForWallConnectionTest } from './test/fields';
import { Field } from '../../webbugs-common/src/models/field';
import { Component } from '../../webbugs-common/src/models/component';
import { ClickContract } from '../../webbugs-common/src/contract/click_contract';
import { FieldReducer } from './handlers';
import { ClickEvent } from '../../webbugs-common/src/models/events';

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 5001;
const STATIC_PATH = path.join(__dirname, '../../../../webbugs-client/dist/');

let connectedClients : any[] = [];
let field : Field = null;
let components: Record<string, Component> = {}
let reducer: FieldReducer = null;
let socket : socketio.Server = null;

const onFieldUpdate = () => {
  const data: DataContract = {
    field: field,
    components: components
  }

  // for (const client of connectedClients) {
  //   client.emit(MessageType.Data, data);
  // }
  if (socket && connectedClients.length > 0) {
    socket.sockets.emit(MessageType.Data, data);
  }
}

const onClick = (data: ClickContract) => {
  console.log('click', data);
  if (reducer) {
    reducer.handle(new ClickEvent(data.p, data.playerID));
  }
}

const fieldData = fieldForWallConnectionTest(onFieldUpdate);
field = fieldData.field;
components = fieldData.components;
reducer = fieldData.reducer;

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

  const data: DataContract = {
    field: field,
    components: components
  }

  client.emit(MessageType.Data, data);
});
// socket.listen(WS_PORT);
console.log('path for static: ', STATIC_PATH);
