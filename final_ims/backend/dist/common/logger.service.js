"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const fs = require("fs");
const path = require("path");
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
const appendLog = (file, message) => {
    const logFile = path.join(logsDir, file);
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