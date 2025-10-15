-- 🔐 SCRIPT SQL - CRIAR USUÁRIO DE TESTE
-- Database: PostgreSQL (hpo-platform-backend)
-- Uso: Executar no PostgreSQL para criar usuário admin@test.com com senha conhecida

-- ====================================
-- 1. CRIAR USUÁRIO DE TESTE (SUPER_ADMIN)
-- ====================================

-- Senha: "admin123"
-- Hash bcrypt gerado com salt rounds = 10
-- Você pode gerar novo hash em: https://bcrypt-generator.com/

INSERT INTO "User" (
  id,
  email,
  name,
  password_hash,
  role,
  "isActive",
  "hasCompletedOnboarding",
  points,
  level,
  "currentStreak",
  "longestStreak",
  "lastActiveDate",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),  -- Gera UUID automaticamente
  'admin@test.com',   -- Email de teste
  'Admin Teste',      -- Nome
  '$2b$10$rZ3PJ3aHnC1O4x.dZ5F8KeFp7hQvkZJ7.3CQMWoN1xP3V1LGkRYbO',  -- Hash de "admin123"
  'SUPER_ADMIN',      -- Role máxima
  true,               -- Conta ativa
  true,               -- Onboarding completo (não mostra tour)
  1000,               -- 1000 pontos iniciais
  5,                  -- Nível 5
  10,                 -- 10 dias de streak
  15,                 -- Maior streak: 15 dias
  NOW(),              -- Último acesso: agora
  NOW(),              -- Criado agora
  NOW()               -- Atualizado agora
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,  -- Atualiza senha se já existir
  role = EXCLUDED.role,                    -- Garante que seja SUPER_ADMIN
  "isActive" = true,
  "updatedAt" = NOW();

-- ====================================
-- 2. CRIAR USUÁRIO TRADUTOR (TRANSLATOR)
-- ====================================

INSERT INTO "User" (
  id,
  email,
  name,
  password_hash,
  role,
  "isActive",
  "hasCompletedOnboarding",
  points,
  level,
  "currentStreak",
  "longestStreak",
  "lastActiveDate",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'tradutor@test.com',
  'Tradutor Teste',
  '$2b$10$rZ3PJ3aHnC1O4x.dZ5F8KeFp7hQvkZJ7.3CQMWoN1xP3V1LGkRYbO',  -- Senha: "admin123"
  'TRANSLATOR',       -- Role básica
  true,
  false,              -- Não completou onboarding (verá o tour)
  50,                 -- 50 pontos
  1,                  -- Nível 1
  0,                  -- Sem streak
  0,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  "updatedAt" = NOW();

-- ====================================
-- 3. CRIAR USUÁRIO REVISOR (COMMITTEE_MEMBER)
-- ====================================

INSERT INTO "User" (
  id,
  email,
  name,
  password_hash,
  role,
  "isActive",
  "hasCompletedOnboarding",
  points,
  level,
  "currentStreak",
  "longestStreak",
  "lastActiveDate",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'revisor@test.com',
  'Revisor Teste',
  '$2b$10$rZ3PJ3aHnC1O4x.dZ5F8KeFp7hQvkZJ7.3CQMWoN1xP3V1LGkRYbO',  -- Senha: "admin123"
  'COMMITTEE_MEMBER', -- Role de revisor
  true,
  true,
  500,                -- 500 pontos
  3,                  -- Nível 3
  5,
  10,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- ====================================
-- 4. VERIFICAR USUÁRIOS CRIADOS
-- ====================================

SELECT 
  email, 
  name, 
  role, 
  points, 
  level, 
  "hasCompletedOnboarding",
  "isActive"
FROM "User"
WHERE email IN ('admin@test.com', 'tradutor@test.com', 'revisor@test.com')
ORDER BY role DESC;

-- ====================================
-- CREDENCIAIS DE LOGIN
-- ====================================

/*
✅ USUÁRIOS CRIADOS:

1. SUPER_ADMIN:
   Email: admin@test.com
   Senha: admin123
   Acesso: Full (aprovar/rejeitar/banir/analytics/sync)

2. TRANSLATOR:
   Email: tradutor@test.com
   Senha: admin123
   Acesso: Traduzir termos, ver histórico, leaderboard

3. COMMITTEE_MEMBER:
   Email: revisor@test.com
   Senha: admin123
   Acesso: Traduzir + Validar traduções + Resolver conflitos
*/

-- ====================================
-- COMO EXECUTAR ESTE SCRIPT
-- ====================================

/*
OPÇÃO 1: PostgreSQL CLI (psql)
-------------------------------
cd hpo-platform-backend
psql -U postgres -d hpo_translator -f create_test_users.sql


OPÇÃO 2: DBeaver / pgAdmin / DataGrip
--------------------------------------
1. Conectar ao banco: postgresql://localhost:5432/hpo_translator
2. Copiar este script e executar (F5 ou Ctrl+Enter)


OPÇÃO 3: Prisma Studio
-----------------------
1. npm run prisma:studio
2. Adicionar usuários manualmente pela UI


OPÇÃO 4: Node.js Script
------------------------
cd hpo-platform-backend
npx tsx prisma/create-test-users.ts
(criar arquivo create-test-users.ts com código abaixo)


OPÇÃO 5: API REST (já logado)
------------------------------
POST http://localhost:5000/api/auth/register
Body:
{
  "email": "admin@test.com",
  "password": "admin123",
  "name": "Admin Teste"
}
(Depois usar endpoint para upgrade de role)
*/

-- ====================================
-- RESETAR SENHA DE USUÁRIO EXISTENTE
-- ====================================

/*
Se já existe um usuário (ex: filipeandradebernardi@gmail.com) 
e você esqueceu a senha, execute:
*/

-- UPDATE "User"
-- SET password_hash = '$2b$10$rZ3PJ3aHnC1O4x.dZ5F8KeFp7hQvkZJ7.3CQMWoN1xP3V1LGkRYbO'
-- WHERE email = 'filipeandradebernardi@gmail.com';

-- Nova senha será: admin123

-- ====================================
-- DELETAR USUÁRIOS DE TESTE (CLEANUP)
-- ====================================

/*
DELETE FROM "User"
WHERE email IN ('admin@test.com', 'tradutor@test.com', 'revisor@test.com');
*/

-- ====================================
-- FIM DO SCRIPT
-- ====================================
