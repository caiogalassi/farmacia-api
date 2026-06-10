-- Script de inicializacao do banco de dados
-- Executado automaticamente pelo Spring Boot na primeira execucao

-- Dados de exemplo: Medicamentos
INSERT INTO medicamentos (nome, principio_ativo, categoria, fabricante, quantidade, quantidade_minima, preco, data_validade, requer_receita, criado_em, atualizado_em)
SELECT 'Paracetamol 750mg', 'Paracetamol', 'Analgesico', 'EMS', 50, 10, 8.90, '2026-12-01', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM medicamentos WHERE nome = 'Paracetamol 750mg');

INSERT INTO medicamentos (nome, principio_ativo, categoria, fabricante, quantidade, quantidade_minima, preco, data_validade, requer_receita, criado_em, atualizado_em)
SELECT 'Dipirona 500mg', 'Dipirona Sodica', 'Analgesico', 'Medley', 8, 15, 7.50, '2026-06-01', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM medicamentos WHERE nome = 'Dipirona 500mg');

INSERT INTO medicamentos (nome, principio_ativo, categoria, fabricante, quantidade, quantidade_minima, preco, data_validade, requer_receita, criado_em, atualizado_em)
SELECT 'Amoxicilina 500mg', 'Amoxicilina', 'Antibiotico', 'Teuto', 4, 10, 24.00, '2026-03-01', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM medicamentos WHERE nome = 'Amoxicilina 500mg');

INSERT INTO medicamentos (nome, principio_ativo, categoria, fabricante, quantidade, quantidade_minima, preco, data_validade, requer_receita, criado_em, atualizado_em)
SELECT 'Ibuprofeno 400mg', 'Ibuprofeno', 'Anti-inflamatorio', 'Neo Quimica', 32, 10, 12.00, '2026-09-01', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM medicamentos WHERE nome = 'Ibuprofeno 400mg');

INSERT INTO medicamentos (nome, principio_ativo, categoria, fabricante, quantidade, quantidade_minima, preco, data_validade, requer_receita, criado_em, atualizado_em)
SELECT 'Omeprazol 20mg', 'Omeprazol', 'Gastrico', 'Eurofarma', 6, 10, 18.50, '2026-05-01', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM medicamentos WHERE nome = 'Omeprazol 20mg');

INSERT INTO medicamentos (nome, principio_ativo, categoria, fabricante, quantidade, quantidade_minima, preco, data_validade, requer_receita, criado_em, atualizado_em)
SELECT 'Vitamina C 1g', 'Acido Ascorbico', 'Suplemento', 'Bayer', 55, 10, 22.00, '2027-08-01', false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM medicamentos WHERE nome = 'Vitamina C 1g');

-- Dados de exemplo: Clientes
INSERT INTO clientes (nome, cpf, email, telefone, criado_em, atualizado_em)
SELECT 'Maria Silva', '123.456.789-00', 'maria@email.com', '(43) 99999-1111', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cpf = '123.456.789-00');

INSERT INTO clientes (nome, cpf, email, telefone, criado_em, atualizado_em)
SELECT 'Joao Pereira', '987.654.321-00', 'joao@email.com', '(43) 99999-2222', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cpf = '987.654.321-00');

INSERT INTO clientes (nome, cpf, email, telefone, criado_em, atualizado_em)
SELECT 'Ana Souza', '456.789.123-00', 'ana@email.com', '(43) 99999-3333', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cpf = '456.789.123-00');
