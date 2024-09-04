import path from 'path';
import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';

export async function GET(_req: Request) {
  const logDir = process.env.LOGS_DIR;

  console.log(`logsDir: ${logDir}`);

  if (!logDir) {
    return new NextResponse('LOGS_DIR environment variable is not set', {
      status: 500,
    });
  }

  try {
    const logFiles = await fs.readdir(logDir);
    const zipFileName = 'logs.zip';

    // Create a PassThrough stream to pipe the archive data
    const passThrough = new PassThrough();

    // Create an archive instance
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Pipe archive data to the PassThrough stream
    archive.pipe(passThrough);

    logFiles.forEach((file) => {
      const filePath = path.join(logDir, file);
      archive.file(filePath, { name: file });
    });

    // Finalize the archive
    await archive.finalize();

    // Convert Node.js stream to a Web ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        passThrough.on('data', (chunk) => {
          controller.enqueue(chunk);
        });

        passThrough.on('end', () => {
          controller.close();
        });

        passThrough.on('error', (err) => {
          controller.error(err);
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"`,
      },
    });
  } catch (error) {
    console.error('Error generating log ZIP:', error);
    return new NextResponse('Error generating log ZIP', { status: 500 });
  }
}
