import { Injectable } from '@nestjs/common';
import { getStream, launch } from 'puppeteer-stream';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { ScreenRecordReqDto } from './dto';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';

@Injectable()
export class ScreenRecordService {
  public async startRecording(body: ScreenRecordReqDto): Promise<void> {
    const browser = await launch({
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-size=1280,720',
        '--disable-web-security',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.goto(body.url);

    const stream = await getStream(page, { audio: true, video: true });

    const fileName = `videos/${uuidv4()}.webm`;
    const fileStream = fs.createWriteStream(fileName);
    stream.pipe(fileStream);

    return new Promise<void>(async (resolve) => {
      setTimeout(async () => {
        stream.destroy();
        console.log('Stopping the recording...');
        fileStream.close();
        await browser.close();
        await this.mergeVideos();
        resolve();
      }, body.time);
    });
  }

  private async mergeVideos(): Promise<void> {
    const inputFolder = './videos/';
    const outputFolder = './video_output/';

    const outputFile = 'final_video.mp4';

    const files = fs
      .readdirSync(inputFolder)
      .filter((file) => file.endsWith('.webm'));

    if (files.length === 0) {
      throw new Error('No .webm files found to merge.');
    }

    let mergedVideo = ffmpeg();

    files.forEach((file) => {
      mergedVideo = mergedVideo.input(path.join(inputFolder, file));
    });

    const outputFilePath = path.join(outputFolder, outputFile);

    return new Promise((resolve, reject) => {
      mergedVideo
        .on('start', (commandLine) => {
          console.log('Started merging process with command: ', commandLine);
        })
        .on('error', (err) => {
          console.error('Error occurred during merging:', err.message);
          reject(`Error during merging: ${err.message}`);
        })
        .on('end', () => {
          console.log('Merging finished successfully!');
          resolve();
        })
        .mergeToFile(outputFilePath, outputFolder);
    });
  }
}
