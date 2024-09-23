import { Module } from '@nestjs/common';
import { ScreenRecordController } from './controller';
import { ScreenRecordService } from './service';

@Module({
  imports: [],
  controllers: [ScreenRecordController],
  providers: [ScreenRecordService],
})
export class ScreenRecordModule {}
