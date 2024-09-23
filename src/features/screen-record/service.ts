import { Injectable } from '@nestjs/common';
import { getStream, launch } from 'puppeteer-stream';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { ScreenRecordReqDto } from './dto';

@Injectable()
export class ScreenRecordService {
  private sessionFiles: string[] = [];

  public async startRecording(body: ScreenRecordReqDto): Promise<void> {
    const browser = await launch({
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
      args: ['--start-fullscreen'],
    });

    const page = await browser.newPage();
    await page.goto(body.url);

    const stream = await getStream(page, { audio: true, video: true });

    const fileName = `raw/${uuidv4()}.webm`;
    if (!fs.existsSync(fileName)) {
      // Create the directory if it doesn't exist
      fs.mkdirSync(fileName, { recursive: true });
    }

    const fileStream = fs.createWriteStream(fileName);
    stream.pipe(fileStream);

    this.sessionFiles.push(fileName);

    return new Promise<void>((resolve) => {
      stream.on('end', async () => {
        console.log('Recording stopped');
        fileStream.close();
        await browser.close();
        resolve();
      });

      setTimeout(() => {
        stream.destroy();
        console.log('Stopping the recording...');
      }, body.time);
    });
  }
}
