# RARAS-CPLP - Rede de Apoio às Doenças Raras

![RARAS-CPLP Logo](https://img.shields.io/badge/RARAS--CPLP-Platform-blue?style=for-the-badge)

Uma plataforma web completa para a Rede de Apoio às Doenças Raras na Comunidade de Países de Língua Portuguesa (CPLP), focada na tradução colaborativa da HPO (Human Phenotype Ontology), segunda opinião formativa e educação em saúde.

## 🌍 Sobre o Projeto

A RARAS-CPLP é uma iniciativa que visa fortalecer o conhecimento e apoio às doenças raras nos países de língua portuguesa, promovendo:

- **Tradução Colaborativa**: Tradução e validação da ontologia HPO para português
- **Segunda Opinião Formativa**: Consultoria especializada para casos complexos
- **Educação Continuada**: Portal educacional com materiais especializados
- **Mapeamento Digital**: Avaliação da maturidade digital em saúde
- **Repositório FAIR**: Dados e ontologias acessíveis e interoperáveis

## 🚀 Funcionalidades

### 🔤 Módulo de Tradução HPO
- Interface intuitiva para tradução de termos médicos
- Sistema de pontuação e gamificação
- Revisão por pares e controle de qualidade
- Histórico de versões e auditoria

### 🩺 Segunda Opinião Formativa (SOF-CPLP)
- Submissão de casos clínicos estruturados
- Encaminhamento automático para especialistas
- Base de conhecimento pesquisável
- Respostas validadas e publicadas

### 📚 Portal Educacional
- Materiais categorizados por público-alvo
- Filtros avançados de busca
- Sistema de feedback e avaliação
- Upload de conteúdo por gestores

### 📊 Painel de Maturidade Digital
- Avaliação baseada em modelos internacionais
- Análise comparativa entre países
- Dashboard interativo
- Relatórios em PDF/CSV

### ❓ FAQ Interativo
- Perguntas frequentes sobre doenças raras
- Sistema de busca e filtros
- Categorização por temas
- Interface responsiva e acessível

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes de interface
- **React Router** - Roteamento
- **Phosphor Icons** - Ícones
- **Framer Motion** - Animações

### Backend (Planejado)
- **Django/Node.js** - API REST
- **PostgreSQL** - Banco de dados
- **JWT + OAuth2** - Autenticação
- **REDCap API** - Integração de dados

### Infraestrutura
- **Docker** - Containerização
- **Nginx** - Proxy reverso
- **Let's Encrypt** - Certificados SSL
- **Backup automático** - Proteção de dados

## 📱 Design e UX

### Princípios de Design
- **Material Honesty**: Elementos digitais com propriedades físicas intuitivas
- **Simplicidade**: Interface limpa focada no essencial
- **Acessibilidade**: Conformidade com WCAG 2.1 AA
- **Responsividade**: Design mobile-first

### Paleta de Cores
- **Primary**: `oklch(0.5 0.15 250)` - Azul profissional
- **Secondary**: `oklch(0.65 0.08 250)` - Azul suave
- **Accent**: `oklch(0.7 0.18 50)` - Amarelo destaque
- **Background**: `oklch(0.98 0 0)` - Branco neutro

### Tipografia
- **Fonte Principal**: Inter - Legibilidade otimizada
- **Fonte Mono**: JetBrains Mono - Código e dados

## 🎯 Público-Alvo

### Profissionais de Saúde
- Médicos especialistas e generalistas
- Pesquisadores em doenças raras
- Estudantes de medicina
- Profissionais de enfermagem

### Gestores de Saúde
- Administradores hospitalares
- Gestores de políticas públicas
- Coordenadores de programas

### Pacientes e Familiares
- Portadores de doenças raras
- Familiares e cuidadores
- Associações de pacientes

## 🌐 Países da CPLP

A plataforma atende aos seguintes países:
- 🇧🇷 Brasil
- 🇵🇹 Portugal
- 🇦🇴 Angola
- 🇲🇿 Moçambique
- 🇨🇻 Cabo Verde
- 🇬🇼 Guiné-Bissau
- 🇸🇹 São Tomé e Príncipe
- 🇹🇱 Timor-Leste
- 🇬🇶 Guiné Equatorial

## 🔐 Segurança e Privacidade

### Medidas de Segurança
- Autenticação JWT com refresh tokens
- Proteção CSRF e XSS
- Validação de entrada de dados
- Logs de auditoria completos
- Backup automático semanal

### Conformidade
- LGPD (Lei Geral de Proteção de Dados)
- GDPR (General Data Protection Regulation)
- Padrões de segurança em saúde

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Git

### Instalação
```bash
# Clone o repositório
git clone https://github.com/raras-cplp/platform.git

# Entre na pasta do projeto
cd platform

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

### Build para Produção
```bash
# Gere o build otimizado
npm run build

# Visualize o build localmente
npm run preview
```

## 📝 Estrutura do Projeto

```
src/
├── components/
│   ├── layout/           # Layout e navegação
│   ├── pages/            # Páginas principais
│   └── ui/               # Componentes Shadcn
├── lib/
│   └── utils.ts          # Utilitários
├── assets/
│   ├── images/           # Imagens
│   ├── video/            # Vídeos
│   └── audio/            # Áudios
├── App.tsx               # Componente principal
├── index.css             # Estilos globais
└── main.tsx              # Ponto de entrada
```

## 🤝 Como Contribuir

### Para Desenvolvedores
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Para Tradutores
1. Acesse o módulo de tradução na plataforma
2. Cadastre-se como tradutor voluntário
3. Selecione termos para traduzir
4. Submeta suas traduções para revisão

### Para Especialistas
1. Cadastre-se como especialista em sua área
2. Configure suas preferências de notificação
3. Responda às solicitações de segunda opinião
4. Contribua com a base de conhecimento

## 📊 Roadmap

### Fase 1 (Atual)
- [x] Interface básica e navegação
- [x] Módulo de tradução HPO
- [x] Sistema de FAQ
- [x] Portal educacional básico
- [ ] Sistema de autenticação

### Fase 2
- [ ] Segunda opinião formativa
- [ ] Gamificação completa
- [ ] API backend
- [ ] Integração com REDCap

### Fase 3
- [ ] Repositório FAIR
- [ ] IA para sugestões
- [ ] App mobile
- [ ] Análise de dados avançada

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

### Documentação
- [Wiki do Projeto](https://github.com/raras-cplp/platform/wiki)
- [API Documentation](https://api.raras-cplp.org/docs)
- [Guia do Usuário](https://docs.raras-cplp.org)

### Contato
- **Email**: contato@raras-cplp.org
- **Discord**: [Servidor RARAS-CPLP](https://discord.gg/raras-cplp)
- **Issues**: [GitHub Issues](https://github.com/raras-cplp/platform/issues)

### Status do Sistema
- **Produção**: https://status.raras-cplp.org
- **Desenvolvimento**: https://dev.raras-cplp.org

## 🏆 Reconhecimentos

### Parceiros Institucionais
- Orphanet
- Human Phenotype Ontology Consortium
- Ministérios da Saúde dos países da CPLP
- Universidades parceiras

### Apoio Financeiro
- Fundo de Apoio à Pesquisa em Doenças Raras
- Programa de Cooperação Internacional CPLP
- Grants de fundações internacionais

### Contribuidores
Um agradecimento especial a todos os [contribuidores](CONTRIBUTORS.md) que tornaram este projeto possível.

---

<div align="center">
  <p>
    <strong>RARAS-CPLP</strong> - Unindo conhecimento, tecnologia e solidariedade<br>
    em prol das pessoas com doenças raras na CPLP
  </p>
  
  <p>
    <a href="https://raras-cplp.org">🌐 Site Oficial</a> •
    <a href="https://docs.raras-cplp.org">📚 Documentação</a> •
    <a href="https://github.com/raras-cplp">💻 GitHub</a>
  </p>
</div>