import { Observable } from 'rxjs';

interface Bid {
  bidderId: number;
  bidAmount: number;
}

interface CreateLobbyRequest {
  auctionId: number;
}

interface CreateLobbyResponse {
  message: string;
}

interface GetBidsRequest {
  auctionId: number;
}

interface GetBidsResponse {
  bids: Bid[];
}

export interface BidderService {
  createLobby(request: CreateLobbyRequest): Observable<CreateLobbyResponse>;
  getBids(request: GetBidsRequest): Observable<GetBidsResponse>;
}
