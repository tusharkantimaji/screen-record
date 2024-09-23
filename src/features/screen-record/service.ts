import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { getStream } from 'puppeteer-stream';
import * as fs from 'fs-extra';
import * as ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ScreenRecordService {
  private sessionFiles: string[] = [];

  public async startRecording(): Promise<void> {
    const browser = await puppeteer.launch({
      headless: false, // You may need to run with headless: false for proper recording
      args: ['--start-fullscreen'], // Ensures the recording captures the entire screen
    });

    const page = await browser.newPage();
    await page.goto('https://example.com'); // Example URL, replace as needed

    // Get the stream from puppeteer-stream
    const stream = await getStream(page, { audio: false }); // This starts the screen recording

    const fileName = `${uuidv4()}.webm`; // Unique file name for each session
    const fileStream = fs.createWriteStream(fileName); // Create a writable stream
    stream.pipe(fileStream); // Pipe the recording stream to the file

    this.sessionFiles.push(fileName);

    return new Promise<void>((resolve, reject) => {
      stream.on('end', async () => {
        console.log('Recording stopped');
        fileStream.close(); // Close the file stream when recording stops
        await browser.close(); // Close the browser when recording is complete
        resolve();
      });

      // Stop the recording after 10 seconds (or customize the duration)
      setTimeout(() => {
        stream.destroy(); // Proper way to stop the stream recording
        console.log('Stopping the recording...');
      }, 10000); // Set the recording duration (10 seconds in this case)
    });
  }

  public async convertToMp4() {
    const mergedFileName = 'final_output.mp4';

    return new Promise<void>((resolve, reject) => {
      const ffmpegCommand = ffmpeg();

      this.sessionFiles.forEach((file) => {
        ffmpegCommand.input(file);
      });

      ffmpegCommand
        .on('end', () => {
          console.log('Merging completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error during merging', err);
          reject(err);
        })
        .mergeToFile(mergedFileName, './temp');
    });
  }
}
