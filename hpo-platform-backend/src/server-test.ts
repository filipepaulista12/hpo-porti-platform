import express from 'express';
import http from 'http';

const app = express();
const PORT = 3001;

app.get('/health', (req, res) => {
  console.log('✅ Health check request received!');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  console.log(`🚀 MINIMAL TEST SERVER running on port ${PORT}`);
  console.log(`✅ Ready to accept connections`);
});

httpServer.on('error', (error: any) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

console.log('🔍 Starting minimal test server...');
