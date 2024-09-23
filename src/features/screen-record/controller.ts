import { Controller, Post } from '@nestjs/common';
import { ScreenRecordService } from './service';

@Controller()
export class ScreenRecordController {
  constructor(private readonly screenRecordService: ScreenRecordService) {}

  @Post('screen-record')
  getHello(): Promise<void> {
    return this.screenRecordService.startRecording();
  }
}
