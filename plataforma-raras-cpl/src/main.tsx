import { createRoot } from 'react-dom/client'
import ProductionHPOApp from './ProductionHPOApp'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

console.log('🚀 Inicializando HPO-PT PRODUCTION com autenticação real...');
const root = createRoot(container);
root.render(<ProductionHPOApp />);
console.log('✅ Sistema HPO-PT completamente funcional!');
