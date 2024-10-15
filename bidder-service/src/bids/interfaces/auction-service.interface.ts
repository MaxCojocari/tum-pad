import { Observable } from 'rxjs';

export interface IsAuctionRunningRequest {
  auctionId: number;
}

export interface IsAuctionRunningResponse {
  running: boolean;
}
