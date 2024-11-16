export interface Bid {
  id: number;
  auctionId: number;
  bidderId: string;
  amount: number;
  timestamp: Date;
}

export interface CreateLobbyRequest {
  auctionId: number;
}

export interface CreateLobbyResponse {
  message: string;
}

export interface FindBidsByAuctionRequest {
  auctionId: number;
}

export interface FindBidsByAuctionResponse {
  bids: Bid[];
}
