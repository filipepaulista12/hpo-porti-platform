"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        log: [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'event' },
            { level: 'warn', emit: 'event' }
        ]
    });
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
// Log Prisma queries in development
if (process.env.NODE_ENV !== 'production') {
    prisma.$on('query', (e) => {
        logger_1.logger.debug('Query: ' + e.query);
        logger_1.logger.debug('Duration: ' + e.duration + 'ms');
    });
}
prisma.$on('error', (e) => {
    logger_1.logger.error('Prisma Error:', e);
});
prisma.$on('warn', (e) => {
    logger_1.logger.warn('Prisma Warning:', e);
});
if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
}
exports.default = prisma;
//# sourceMappingURL=database.js.map