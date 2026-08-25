"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const fs = require("fs");
const path = require("path");
const logsDir = path.join(process.cwd(), '.logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
const rotateIfNeeded = (logFile) => {
    try {
        if (fs.existsSync(logFile)) {
            const stats = fs.statSync(logFile);
            if (stats.size >= MAX_LOG_SIZE_BYTES) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const ext = path.extname(logFile);
                const base = path.basename(logFile, ext);
                const rotatedFile = path.join(logsDir, `${base}-${timestamp}${ext}`);
                fs.renameSync(logFile, rotatedFile);
            }
        }
    }
    catch (err) {
        console.error('Failed to rotate log file:', err);
    }
};
const appendLog = (file, message) => {
    const logFile = path.join(logsDir, file);
    rotateIfNeeded(logFile);
    fs.appendFile(logFile, message + '\n', (err) => {
        if (err)
            console.error('Failed to write log', err);
    });
};
exports.LoggerService = {
    logAccess: (msg) => appendLog('access.log', `[${new Date().toISOString()}] ${msg}`),
    logError: (msg) => appendLog('error.log', `[${new Date().toISOString()}] ${msg}`),
};
//# sourceMappingURL=logger.service.js.map