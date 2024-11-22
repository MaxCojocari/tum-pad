import { Module } from '@nestjs/common';
import { EtlService } from './etl.service';
import { ExtractService } from './extract.service';
import { TransformService } from './transform.service';
import { LoadService } from './load.service';

@Module({
  providers: [EtlService, ExtractService, TransformService, LoadService],
})
export class EtlModule {}
