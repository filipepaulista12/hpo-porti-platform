# Dockerfile para desenvolvimento do backend
# Usando Debian (node:18) ao invés de Alpine para melhor compatibilidade com Prisma
FROM node:18

# Instalar curl para healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Gerar Prisma Client (Debian tem melhor compatibilidade)
RUN npx prisma generate

# Expor porta
EXPOSE 3001

# Comando para desenvolvimento (com hot reload)
CMD ["npm", "run", "dev"]
