import { Observable } from 'rxjs';

interface IsAuctionRunningRequest {
  auctionId: number;
}

interface IsAuctionRunningResponse {
  running: boolean;
}

export interface AuctionsServiceGrpc {
  isAuctionRunning(
    request: IsAuctionRunningRequest,
  ): Observable<IsAuctionRunningResponse>;
}
