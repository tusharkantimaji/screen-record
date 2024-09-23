import { IsNumber, IsString } from 'class-validator';

export class ScreenRecordReqDto {
  @IsString()
  url: string;

  @IsNumber()
  time: number;
}
