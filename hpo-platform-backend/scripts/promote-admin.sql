-- Promover usuário teste@hpo.com para ADMIN
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'teste@hpo.com';

-- Verificar
SELECT id, name, email, role, points, level 
FROM users 
WHERE email = 'teste@hpo.com';

-- Ver todos os usuários e seus roles
SELECT id, name, email, role, points, level 
FROM users 
ORDER BY role DESC, points DESC;
