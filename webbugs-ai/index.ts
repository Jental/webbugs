import _ = require('lodash');
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import io = require('socket.io-client');
import { ClickContract } from '../webbugs-common/src/contract/click_contract';
import { DataContract } from '../webbugs-common/src/contract/data_contract';
import { MessageType } from '../webbugs-common/src/contract/message_type';
import { MetadataContract } from '../webbugs-common/src/contract/metadata_contract';

import { Component } from "../webbugs-common/src/models/component";
import { Field } from "../webbugs-common/src/models/field";

import { createAIByID } from "./ai-types";

const INTERVAL = 1000;

const socket = io('ws://localhost:5000', { transports: ['websocket'] });

const metadata$ : Observable<MetadataContract> = fromEvent<MetadataContract>(socket, MessageType.Metadata);
const data$ : Observable<DataContract> =
  fromEvent<DataContract>(socket, MessageType.Data)
  .pipe(
    map(data => {
      if (data.field) {
        const field = Field.fromObject(data.field)
        return {
          field: field,
          components: _.mapValues(data.components, (c) => ({
            id: c.id,
            isActive: c.isActive,
            walls: c.wall_ids.map(crd => field.get(crd.page).get(crd.cell))
          }))
        }
      }
      else {
        return {
          field: null,
          components: {}
        };
      }
    })
  );
const field$ : Observable<Field> = data$.pipe(map(d => d.field));
const components$ : Observable<Record<string, Component>> = data$.pipe(map(d => d.components));

const playerTypeNames : string[] =
  process.argv.length <= 2
  ? []
  : process.argv[2].split(',');
const playerIDs : string[] = [];
const players = playerTypeNames.map(name => ({
  typeName: name,
  playerID: null,
  ai: null
}));

socket.on("connect", () => {
  console.log('connected');
  for (const name of playerTypeNames) {
    socket.emit(MessageType.Register);
  }
});

metadata$
.subscribe((metadata) => {
  console.log('metadata', metadata);
  const isNewPlayer = playerIDs.indexOf(metadata.playerID) < 0;
  if (isNewPlayer) {
    const playerInfo = players.find(p => p.playerID === null);
    if (playerInfo) {
      playerIDs.push(metadata.playerID);
      playerInfo.playerID = metadata.playerID;

      console.log('assigned id: ', playerInfo.typeName, '<-', metadata.playerID);

      const ai = createAIByID(playerInfo.typeName, field$, components$, metadata.playerID);
      if (ai) {
        playerInfo.ai = ai;
        
        const interval = setInterval(() => {
          const next = ai.next();
          
          if (next.done) {
            clearInterval(interval);
            console.log('game over', playerInfo.playerID);
          }
          else {
            const data: ClickContract = next.value;
            if (data) {
              // console.log(data.playerID, data.p.cell);
              socket.emit(MessageType.Click, data);
            }
          }
        }, INTERVAL)
      }
    }
  }
});
