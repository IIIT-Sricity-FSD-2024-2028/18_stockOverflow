import * as fs from 'fs';
import * as path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const appendLog = (file: string, message: string) => {
  const logFile = path.join(logsDir, file);
  fs.appendFile(logFile, message + '\n', (err) => {
    if (err) console.error('Failed to write log', err);
  });
};

export const LoggerService = {
  logAccess: (msg: string) => appendLog('access.log', `[${new Date().toISOString()}] ${msg}`),
  logError: (msg: string) => appendLog('error.log', `[${new Date().toISOString()}] ${msg}`),
};