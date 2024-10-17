import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { LobbyService } from './lobby.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly lobbyService: LobbyService) {}

  // Handle client connection
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Handle client disconnection
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Join auction lobby
  @SubscribeMessage('joinAuctionLobby')
  async handleJoinAuctionLobby(
    @MessageBody() data: { auctionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const auctionId = data.auctionId;
    client.join(auctionId.toString()); // Client joins lobby named after auction ID

    console.log(`Client ${client.id} joined auction lobby: ${auctionId}`);

    // Send initial auction data to the client
    const auctionData = await this.lobbyService.getAuctionData(auctionId);

    client.emit('auctionUpdate', auctionData);
  }

  // Broadcast auction updates to all connected clients in the auction lobby
  async sendAuctionUpdate(auctionId: number) {
    const auctionData = await this.lobbyService.getAuctionData(auctionId);
    console.log('Lobby sendAuctionUpdate', auctionData);
    this.server.to(auctionId.toString()).emit('auctionUpdate', auctionData); // Broadcast to the auction lobby room
  }
}
