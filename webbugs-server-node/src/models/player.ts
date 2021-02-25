import * as socketio from 'socket.io';

export interface Player {
  id: string,
  name: string,
  client: socketio.Socket
}