"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Servidor super simples para debug
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log('Starting minimal debug server...');
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3002'); // MUDADO PARA 3002
app.get('/health', (_req, res) => {
    console.log('✅ Health check requested');
    res.json({ status: 'ok', time: new Date().toISOString() });
});
app.get('/test', (_req, res) => {
    console.log('✅ Test endpoint requested');
    res.json({ message: 'Server is working!' });
});
// Forçar IPv4
const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`✅ Debug server running on http://127.0.0.1:${PORT}`);
    console.log(`Try: http://127.0.0.1:${PORT}/health`);
    console.log(`Try: http://127.0.0.1:${PORT}/test`);
});
server.on('error', (err) => {
    console.error('❌ Server error:', err);
});
// Keep alive
const keepAlive = setInterval(() => {
    console.log('💓 Server is alive...', new Date().toISOString());
}, 5000);
// Cleanup
process.on('SIGTERM', () => {
    clearInterval(keepAlive);
    server.close();
});
console.log('✅ Server setup complete');
//# sourceMappingURL=debug-server.js.map