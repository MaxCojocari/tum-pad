import { Module } from '@nestjs/common';
import { EtlJob } from './etl.job';
import { LoadModule } from './load/load.module';
import { TransformModule } from './transform/transform.module';
import { ExtractModule } from './extract/extract.module';

@Module({
  imports: [ExtractModule, TransformModule, LoadModule],
  providers: [EtlJob],
})
export class EtlModule {}
