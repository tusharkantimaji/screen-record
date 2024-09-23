import { Body, Controller, Post } from '@nestjs/common';
import { ScreenRecordService } from './service';
import { ScreenRecordReqDto } from './dto';

@Controller()
export class ScreenRecordController {
  constructor(private readonly screenRecordService: ScreenRecordService) {}

  @Post('screen-record')
  screenRecording(@Body() body: ScreenRecordReqDto): Promise<void> {
    return this.screenRecordService.startRecording(body);
  }
}
