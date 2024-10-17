import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateLobbyDto } from '../bidders/dto/create-lobby.dto';
import { LobbyService } from './lobby.service';

@Controller('lobbies')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Get()
  findAll() {
    return this.lobbyService.findAll();
  }

  @MessagePattern({ cmd: 'create-lobby' })
  createLobby(@Payload() data: CreateLobbyDto) {
    return this.lobbyService.createLobby(data.auctionId);
  }

  @MessagePattern({ cmd: 'get-auction-lobby' })
  findLobby(@Payload() data: CreateLobbyDto) {
    return this.lobbyService.findOne(data.auctionId);
  }
}
