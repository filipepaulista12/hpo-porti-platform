import express from 'express';
import http from 'http';

const app = express();
const PORT = 4000; // PORTA DIFERENTE!

app.get('/health', (req, res) => {
  console.log('✅ Health check request received!');
  res.json({ status: 'ok', port: PORT, timestamp: new Date().toISOString() });
});

const httpServer = http.createServer(app);

// FORÇAR IPv4 explicitamente (127.0.0.1 ao invés de 0.0.0.0)
httpServer.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 TEST SERVER on PORT ${PORT} (binding to 127.0.0.1 - IPv4 ONLY)`);
  console.log(`✅ Server address:`, httpServer.address());
});

httpServer.on('listening', () => {
  console.log('🎧 Server is LISTENING!');
  console.log('📍 Try: http://127.0.0.1:4000/health');
});

httpServer.on('error', (error: any) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

console.log('🔍 Starting test server on port 4000...');

// Keep process alive
setInterval(() => {
  console.log('💓 Server still alive at', new Date().toISOString());
}, 5000);
