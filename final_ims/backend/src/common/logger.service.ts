import * as fs from 'fs';
import * as path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
const dotLogsDir = path.join(process.cwd(), '.logs');

[logsDir, dotLogsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB rotation threshold

const rotateIfNeeded = (targetDir: string, filename: string) => {
  try {
    const logFile = path.join(targetDir, filename);
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size >= MAX_LOG_SIZE_BYTES) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const ext = path.extname(filename);
        const base = path.basename(filename, ext);
        const rotatedFile = path.join(targetDir, `${base}-${timestamp}${ext}`);
        fs.renameSync(logFile, rotatedFile);
      }
    }
  } catch (err) {
    console.error('Failed to rotate log file:', err);
  }
};

const appendLog = (file: string, message: string) => {
  const timestampedMessage = `[${new Date().toISOString()}] ${message}\n`;
  [logsDir, dotLogsDir].forEach((dir) => {
    rotateIfNeeded(dir, file);
    const logFile = path.join(dir, file);
    fs.appendFile(logFile, timestampedMessage, (err) => {
      if (err) console.error(`Failed to write log to ${logFile}`, err);
    });
  });
};

export const LoggerService = {
  logAccess: (msg: string) => appendLog('access.log', msg),
  logError: (msg: string) => appendLog('error.log', msg),
};
