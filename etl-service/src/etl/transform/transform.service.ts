import { Injectable } from '@nestjs/common';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { Bidder } from '../entities/bidder.entity';
import { Lobby } from '../entities/lobby.entity';
import { Item } from '../entities/item.entity';

@Injectable()
export class TransformService {
  transformAuctions(auctions: Auction[]): any[] {
    return auctions.map((auction) => ({
      id: auction.id,
      name: auction.name,
      sellerId: auction.sellerId,
      item: {
        id: auction.item.id,
        name: auction.item.name,
        reservePrice: auction.item.reservePrice,
        currency: auction.item.currency,
      },
      startTimestamp: auction.startTimestamp,
      endTimestamp: auction.endTimestamp,
      status: auction.status,
      winnerId: auction.winnerId,
      winningFinalAmount: auction.winningFinalAmount,
    }));
  }

  transformItems(items: Item[]) {
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      auction: item.auction,
      reservePrice: item.reservePrice,
      currency: item.currency,
    }));
  }

  transformBids(bids: Bid[]): any[] {
    return bids.map((bid) => ({
      id: bid.id,
      auctionId: bid.auctionId,
      bidderId: bid.bidderId,
      amount: bid.amount,
      timestamp: bid.timestamp,
    }));
  }

  transformBidders(bidders: Bidder[]): any[] {
    return bidders.map((bidder) => ({
      name: bidder.name,
      email: bidder.email,
    }));
  }

  transformLobbies(lobbies: Lobby[]): any[] {
    return lobbies.map((lobby) => ({
      id: lobby.id,
      auctionId: lobby.auctionId,
      lobbyWsUrl: lobby.lobbyWsUrl,
    }));
  }
}
