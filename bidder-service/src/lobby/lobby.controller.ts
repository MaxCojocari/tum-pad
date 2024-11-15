import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LobbyService } from './lobby.service';

@Controller('lobbies')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Get()
  findAll() {
    return this.lobbyService.findAll();
  }

  @Post()
  create(@Payload() data: { auctionId: number }) {
    return this.lobbyService.createLobby(data.auctionId);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.lobbyService.deleteLobby(id);
  }

  @MessagePattern({ cmd: 'get-auction-lobby' })
  findLobby(@Payload() data: { auctionId: number }) {
    return this.lobbyService.findOne(data.auctionId);
  }
}
