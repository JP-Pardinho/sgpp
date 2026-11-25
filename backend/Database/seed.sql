USE sgpp_db;

-- ============================================================================
-- 1. TABELA: Participante (Dados Fictícios)
-- Tipos: Docente, Discente, Técnico
-- Perfis: Administrador (AT01), Coordenador (AT02), Participante (AT03)
-- ============================================================================
INSERT INTO Participante (cpf, nome, emailInstitucional, tipo, senhaHash, perfilAcesso) VALUES
('111.111.111-01', 'Ana Beatriz Souza', 'ana.souza@ufes.br', 'Técnico', 'senha123', 'Administrador'),
('222.222.222-02', 'Dr. Marcos Vinícius Almeida', 'marcos.almeida@ufes.br', 'Docente', 'senha123', 'Coordenador'),
('333.333.333-03', 'Dra. Helena Costa Ribeiro', 'helena.ribeiro@ufes.br', 'Docente', 'senha123', 'Coordenador'),
('444.444.444-04', 'Dr. Ricardo Gomes Pereira', 'ricardo.pereira@ufes.br', 'Docente', 'senha123', 'Coordenador'),
('555.555.555-05', 'Lucas Ferreira Martins', 'lucas.martins@edu.ufes.br', 'Discente', 'senha123', 'Participante'),
('666.666.666-06', 'Mariana Silva Oliveira', 'mariana.oliveira@edu.ufes.br', 'Discente', 'senha123', 'Participante'),
('777.777.777-07', 'Pedro Henrique Santos', 'pedro.santos@edu.ufes.br', 'Discente', 'senha123', 'Participante'),
('888.888.888-08', 'Juliana Castro Lima', 'juliana.lima@edu.ufes.br', 'Discente', 'senha123', 'Participante'),
('999.999.999-09', 'Roberto Alves Teixeira', 'roberto.teixeira@ufes.br', 'Técnico', 'senha123', 'Participante');

-- ============================================================================
-- 2. TABELA: Projeto (Dados Fictícios)
-- Situações: Em andamento, Concluído, Cancelado
-- RN01: Um docente pode coordenar vários projetos, mas cada projeto tem 1 coordenador
-- ============================================================================
INSERT INTO Projeto (codigo, titulo, descricao, situacao, dataInicio, dataFim, coordenador_cpf) VALUES
('PRJ-2025-001', 'Sistema Inteligente de Monitoramento Hídrico', 'Pesquisa sobre sensores IoT para análise da qualidade da água em bacias hidrográficas.', 'Concluído', '2025-02-01', '2026-01-31', '222.222.222-02'),
('PRJ-2026-002', 'Otimização de Redes Neurais para Diagnóstico Médico', 'Estudo de arquiteturas leves de aprendizado profundo aplicadas a exames de imagem.', 'Em andamento', '2026-03-01', '2027-02-28', '222.222.222-02'),
('PRJ-2026-003', 'Biodiversidade e Conservação de Ecossistemas Costeiros', 'Levantamento de fauna e flora em regiões estuarinas e propostas de preservação.', 'Em andamento', '2026-04-01', '2028-03-31', '333.333.333-03'),
('PRJ-2026-004', 'Plataforma de Dados Abertos para Gestão Pública', 'Desenvolvimento de ferramentas de visualização e transparência de indicadores municipais.', 'Em andamento', '2026-05-10', '2027-05-10', '444.444.444-04'),
('PRJ-2025-005', 'Análise de Poluentes Atmosféricos em Áreas Urbanas', 'Modelagem estatística da dispersão de partículas em centros urbanos.', 'Cancelado', '2025-06-01', '2026-05-31', '333.333.333-03');

-- ============================================================================
-- 3. TABELA: Financiamento (Dados Fictícios)
-- Agências: CNPq, FAPES, CAPES
-- Tipos de Fomento: Bolsa, Auxílio, Convênio
-- ============================================================================
INSERT INTO Financiamento (id_financiamento, agenciaFinanciadora, tipoFomento, valorTotal, dataInicio, dataFim) VALUES
(1, 'CNPq', 'Auxílio', 120000.00, '2026-01-01', '2027-12-31'),
(2, 'FAPES', 'Bolsa', 48000.00, '2026-03-01', '2027-02-28'),
(3, 'CAPES', 'Bolsa', 72000.00, '2026-04-01', '2028-03-31'),
(4, 'FAPES', 'Convênio', 150000.00, '2025-01-01', '2026-12-15'),
(5, 'CNPq', 'Bolsa', 36000.00, '2026-05-01', '2027-04-30');

-- ============================================================================
-- 4. TABELA: Producao_Cientifica (Dados Fictícios)
-- Tipos: Artigo, Capítulo de livro, Software, Relatório técnico
-- ============================================================================
INSERT INTO Producao_Cientifica (id_producao, projeto_codigo, titulo, tipoProducao, anoPublicacao, meioDivulgacao) VALUES
(1, 'PRJ-2025-001', 'Arquitetura IoT de Baixo Custo para Monitoramento de Rios', 'Artigo', 2025, 'Revista Brasileira de Recursos Hídricos'),
(2, 'PRJ-2025-001', 'HydroSense: Firmware de Coleta e Transmissão de Dados', 'Software', 2026, 'Repositório Institucional da UFES'),
(3, 'PRJ-2026-002', 'Redes Convolucionais Compactas na Detecção de Patologias', 'Artigo', 2026, 'Congresso Brasileiro de Informática em Saúde'),
(4, 'PRJ-2026-003', 'Impactos Ambientais em Zonas Estuarinas Capixabas', 'Capítulo de livro', 2026, 'Editora Universitária - Série Meio Ambiente'),
(5, 'PRJ-2026-004', 'Mapeamento de Dados Abertos na Administração Municipal', 'Relatório técnico', 2026, 'Repositório de Políticas Públicas');

-- ============================================================================
-- 5. TABELA ASSOCIATIVA: Projeto_Participante (Dados Fictícios)
-- Funções: Coordenador, Bolsista, Colaborador, Apoio Técnico
-- RN02: Um participante pode atuar em vários projetos simultaneamente
-- ============================================================================
INSERT INTO Projeto_Participante (projeto_codigo, participante_cpf, funcao, dataEntrada, dataSaida) VALUES
-- Equipe do Projeto PRJ-2025-001 (Concluído)
('PRJ-2025-001', '222.222.222-02', 'Coordenador', '2025-02-01', '2026-01-31'),
('PRJ-2025-001', '555.555.555-05', 'Bolsista', '2025-02-15', '2026-01-31'),
('PRJ-2025-001', '999.999.999-09', 'Apoio Técnico', '2025-03-01', '2025-12-20'),

-- Equipe do Projeto PRJ-2026-002 (Em andamento)
('PRJ-2026-002', '222.222.222-02', 'Coordenador', '2026-03-01', NULL),
('PRJ-2026-002', '555.555.555-05', 'Bolsista', '2026-03-01', NULL),
('PRJ-2026-002', '666.666.666-06', 'Colaborador', '2026-03-15', NULL),

-- Equipe do Projeto PRJ-2026-003 (Em andamento)
('PRJ-2026-003', '333.333.333-03', 'Coordenador', '2026-04-01', NULL),
('PRJ-2026-003', '666.666.666-06', 'Bolsista', '2026-04-01', NULL),
('PRJ-2026-003', '777.777.777-07', 'Bolsista', '2026-04-10', NULL),
('PRJ-2026-003', '999.999.999-09', 'Apoio Técnico', '2026-04-05', NULL),

-- Equipe do Projeto PRJ-2026-004 (Em andamento)
('PRJ-2026-004', '444.444.444-04', 'Coordenador', '2026-05-10', NULL),
('PRJ-2026-004', '888.888.888-08', 'Bolsista', '2026-05-15', NULL),

-- Equipe do Projeto PRJ-2025-005 (Cancelado)
('PRJ-2025-005', '333.333.333-03', 'Coordenador', '2025-06-01', '2025-11-30'),
('PRJ-2025-005', '777.777.777-07', 'Colaborador', '2025-06-10', '2025-11-30');

-- ============================================================================
-- 6. TABELA ASSOCIATIVA: Apoio_Financeiro (Dados Fictícios)
-- Vínculos: Total, Parcial
-- RN03: Um financiamento pode apoiar vários projetos (Parcial) e um projeto pode ter vários financiamentos
-- ============================================================================
INSERT INTO Apoio_Financeiro (projeto_codigo, id_financiamento, tipoVinculo, valorDestinado) VALUES
-- Financiamento 1 (CNPq - R$ 120.000,00) dividido parcialmente entre 2 projetos (sobrando R$ 45.000,00 de saldo)
('PRJ-2026-002', 1, 'Parcial', 45000.00),
('PRJ-2026-003', 1, 'Parcial', 30000.00),

-- Financiamento 2 (FAPES - R$ 48.000,00) vinculado integralmente ao projeto PRJ-2026-002
('PRJ-2026-002', 2, 'Total', 48000.00),

-- Financiamento 3 (CAPES - R$ 72.000,00) vinculado integralmente ao projeto PRJ-2026-003
('PRJ-2026-003', 3, 'Total', 72000.00),

-- Financiamento 4 (FAPES - R$ 150.000,00) apoiou parcialmente o projeto PRJ-2025-001
('PRJ-2025-001', 4, 'Parcial', 90000.00),

-- Financiamento 5 (CNPq - R$ 36.000,00) vinculado integralmente ao projeto PRJ-2026-004
('PRJ-2026-004', 5, 'Total', 36000.00);

-- ============================================================================
-- 7. TABELA ASSOCIATIVA: Producao_Autor (Dados Fictícios)
-- RN04: Todos os autores estão previamente cadastrados na tabela Participante
-- ============================================================================
INSERT INTO Producao_Autor (producao_id, participante_cpf) VALUES
-- Produção 1 (Artigo do projeto PRJ-2025-001)
(1, '222.222.222-02'),
(1, '555.555.555-05'),

-- Produção 2 (Software do projeto PRJ-2025-001)
(2, '222.222.222-02'),
(2, '555.555.555-05'),
(2, '999.999.999-09'),

-- Produção 3 (Artigo do projeto PRJ-2026-002)
(3, '222.222.222-02'),
(3, '555.555.555-05'),
(3, '666.666.666-06'),

-- Produção 4 (Capítulo de livro do projeto PRJ-2026-003)
(4, '333.333.333-03'),
(4, '666.666.666-06'),
(4, '777.777.777-07'),

-- Produção 5 (Relatório técnico do projeto PRJ-2026-004)
(5, '444.444.444-04'),
(5, '888.888.888-08');
