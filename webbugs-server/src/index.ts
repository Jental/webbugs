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

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 5001;

let connectedClients : any[] = [];
let field : Field = null;
let components: Record<string, Component> = {}
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

const fieldData = fieldForWallConnectionTest(onFieldUpdate);
field = fieldData.field;
components = fieldData.components;

let setCORS = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
};

const expressI : Express = express();
const httpServer : http.Server =
  expressI
  .use(express.static(path.join(__dirname, '../webbugs-client/dist/')))
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

  const data: DataContract = {
    field: field,
    components: components
  }

  client.emit(MessageType.Data, data);
});
// socket.listen(WS_PORT);
console.log('Listening for messages on port ', WS_PORT);

