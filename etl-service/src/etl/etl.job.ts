import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExtractService } from './extract/extract.service';
import { LoadService } from './load/load.service';
import { TransformService } from './transform/transform.service';

@Injectable()
export class EtlJob {
  constructor(
    private readonly extractService: ExtractService,
    private readonly transformService: TransformService,
    private readonly loadService: LoadService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async runETL() {
    console.log('job running');

    const auctions = await this.extractService.extractAuctions();
    const items = await this.extractService.extractItems();
    const bids = await this.extractService.extractBids();
    const bidders = await this.extractService.extractBidders();
    const lobbies = await this.extractService.extractLobbies();

    console.log('done extract');

    const transformedAuctions =
      this.transformService.transformAuctions(auctions);
    const transformedItems = this.transformService.transformItems(items);
    const transformedBids = this.transformService.transformBids(bids);
    const transformedBidders = this.transformService.transformBidders(bidders);
    const transformedLobbies = this.transformService.transformLobbies(lobbies);

    console.log('done transform');

    await this.loadService.loadAuctions(transformedAuctions);
    await this.loadService.loadItems(transformedItems);
    await this.loadService.loadBids(transformedBids);
    await this.loadService.loadBidders(transformedBidders);
    await this.loadService.loadLobbies(transformedLobbies);
    console.log('done load');
  }
}
