import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LobbyService } from './lobby.service';
import { LobbyGateway } from './lobby.gateway';

@Controller('lobbies')
export class LobbyController {
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly lobbyWsGateway: LobbyGateway,
  ) {}

  @Get()
  findAll() {
    return this.lobbyService.findAll();
  }

  @MessagePattern({ cmd: 'create-lobby' })
  createLobby(@Payload() data: { auctionId: number }) {
    return this.lobbyService.createLobby(data.auctionId);
  }

  @MessagePattern({ cmd: 'get-auction-lobby' })
  findLobby(@Payload() data: { auctionId: number }) {
    return this.lobbyService.findOne(data.auctionId);
  }

  @MessagePattern({ cmd: 'send-auction-update' })
  sendAuctionUpdate(@Payload() data: { auctionId: number }) {
    console.log('send-auction-update');
    return this.lobbyWsGateway.sendAuctionUpdate(data.auctionId);
  }
}
