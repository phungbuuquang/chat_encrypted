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

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.userId); // Cho user vào một "phòng" riêng dựa trên ID của họ
    console.log(`User ${data.userId} joined their private room`);
  }

  // Listens for "sendMessage" events from clients
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { to: string; from: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message from ${data.from}: ${data.content}`);

    this.server.to(data.to).emit('receive_message', {
      from: data.from,
      content: data.content,
      timestamp: new Date().toISOString(),
    });
  }
}
