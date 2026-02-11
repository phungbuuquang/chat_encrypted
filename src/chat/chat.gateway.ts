import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  // Called once after the gateway is initialized
  afterInit() {
    this.logger.log('Chat gateway initialized');
  }

  // Called every time a client connects
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // Called every time a client disconnects
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Listens for "sendMessage" events from clients
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { sender: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message from ${data.sender}: ${data.message}`);

    // Broadcast the message to ALL connected clients (including sender)
    this.server.emit('receiveMessage', {
      sender: data.sender,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  }
}
