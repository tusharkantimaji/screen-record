import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScreenRecordModule } from './features/screen-record/module';

@Module({
  imports: [ScreenRecordModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
