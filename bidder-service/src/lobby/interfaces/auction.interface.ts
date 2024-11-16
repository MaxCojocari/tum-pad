export enum AuctionStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  CLOSED = 'CLOSED',
}

export interface Auction {
  id: number;
  name: string;
  sellerId: number;
  item: any;
  startTimestamp: string;
  endTimestamp: string;
  status: AuctionStatus;
  bids: any[];
  winnerId?: string;
  winningFinalAmount?: number;
}
