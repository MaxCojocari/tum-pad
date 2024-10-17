import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { LobbyService } from './lobby.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: /\/auctions\/\d+\/lobby/ })
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly lobbyService: LobbyService) {}

  async handleConnection(client: Socket) {
    const auctionId = this.extractAuctionIdFromNamespace(client.nsp.name);
    const lobbyInfo = await this.lobbyService.findOne(+auctionId);

    if (!lobbyInfo) {
      client.emit('error', `Lobby with auction id ${auctionId} not found`);
      client.disconnect(true);
      return;
    }

    if (auctionId) {
      console.log(
        `Client ${client.id} connected to auction lobby: ${auctionId}`,
      );
      client.join(auctionId);
      const auctionData = await this.lobbyService.getAuctionData(+auctionId);
      client.emit('auctionUpdate', auctionData);
    }
  }

  handleDisconnect(client: Socket) {
    const auctionId = this.extractAuctionIdFromNamespace(client.nsp.name);
    console.log(
      `Client ${client.id} disconnected from auction lobby: ${auctionId}`,
    );
  }

  // Broadcast auction updates to all connected clients in the auction lobby
  async sendAuctionUpdate(auctionId: number) {
    const auctionData = await this.lobbyService.getAuctionData(auctionId);
    // Broadcast to the auction lobby room
    this.server.to(auctionId.toString()).emit('auctionUpdate', auctionData);
  }

  private extractAuctionIdFromNamespace(namespace: string): string | null {
    const match = namespace.match(/\/auctions\/(\d+)\/lobby/);
    return match ? match[1] : null;
  }
}
