import { Injectable } from '@nestjs/common';
import { getStream, launch } from 'puppeteer-stream';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ScreenRecordService {
  private sessionFiles: string[] = [];

  private readonly URL_TO_READ =
    'https://www.youtube.com/watch?v=G_yaHg-PQaI&ab_channel=IshanSharma';

  public async startRecording(): Promise<void> {
    const browser = await launch({
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
      args: ['--start-fullscreen'],
    });

    const page = await browser.newPage();
    await page.goto(this.URL_TO_READ);

    const stream = await getStream(page, { audio: true, video: true });

    const fileName = `${uuidv4()}.webm`;
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
      }, 10000);
    });
  }
}
