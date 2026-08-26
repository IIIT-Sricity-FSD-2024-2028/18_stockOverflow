"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const fs = require("fs");
const path = require("path");
const logsDir = path.join(process.cwd(), 'logs');
const dotLogsDir = path.join(process.cwd(), '.logs');
[logsDir, dotLogsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
const rotateIfNeeded = (targetDir, filename) => {
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
    }
    catch (err) {
        console.error('Failed to rotate log file:', err);
    }
};
const appendLog = (file, message) => {
    const timestampedMessage = `[${new Date().toISOString()}] ${message}\n`;
    [logsDir, dotLogsDir].forEach((dir) => {
        rotateIfNeeded(dir, file);
        const logFile = path.join(dir, file);
        fs.appendFile(logFile, timestampedMessage, (err) => {
            if (err)
                console.error(`Failed to write log to ${logFile}`, err);
        });
    });
};
exports.LoggerService = {
    logAccess: (msg) => appendLog('access.log', msg),
    logError: (msg) => appendLog('error.log', msg),
};
//# sourceMappingURL=logger.service.js.map