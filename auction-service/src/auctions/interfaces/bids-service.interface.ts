import { Observable } from 'rxjs';

export interface Bid {
  id: number;
  auctionId: number;
  bidderId: number;
  amount: number;
  timestamp: Date;
}

interface CreateLobbyRequest {
  auctionId: number;
}

interface CreateLobbyResponse {
  message: string;
}

interface FindBidsByAuctionRequest {
  auctionId: number;
}

interface FindBidsByAuctionResponse {
  bids: Bid[];
}

export interface BidsServiceGrpc {
  createLobby(request: CreateLobbyRequest): Observable<CreateLobbyResponse>;
  findBidsByAuction(
    request: FindBidsByAuctionRequest,
  ): Observable<FindBidsByAuctionResponse>;
}
