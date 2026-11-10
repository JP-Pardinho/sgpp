CREATE DATABASE sgpp_db;
USE sgpp_db;

-- Tabela Participante
CREATE TABLE Participante (
    cpf VARCHAR(14) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    emailInstitucional VARCHAR(150) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    senhaHash VARCHAR(255) NOT NULL,
    perfilAcesso VARCHAR(50) NOT NULL
);

-- Tabela Projeto
CREATE TABLE Projeto (
    codigo CHAR(30) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    situacao VARCHAR(50) NOT NULL,
    dataInicio DATE NOT NULL,
    dataFim DATE NOT NULL,
    coordenador_cpf VARCHAR(14) NOT NULL,
    FOREIGN KEY (coordenador_cpf) REFERENCES Participante(cpf)
);

CREATE TABLE Financiamento (
    id_financiamento INT PRIMARY KEY,
    agenciaFinanciadora VARCHAR(50) NOT NULL,
    tipoFomento VARCHAR(50) NOT NULL,
    valorTotal DECIMAL(15,2) NOT NULL,
    dataInicio DATE NOT NULL,
    dataFim DATE NOT NULL
);


CREATE TABLE Producao_Cientifica (
    id_producao INT PRIMARY KEY,
    projeto_codigo VARCHAR(30),
    titulo VARCHAR(255) NOT NULL,
    tipoProducao VARCHAR(50) NOT NULL,
    anoPublicacao INT NOT NULL,
    meioDivulgacao VARCHAR(150) NOT NULL,
    FOREIGN KEY (projeto_codigo) REFERENCES Projeto(codigo) ON DELETE CASCADE
);

-- Tabela Associativa Projeto_Participante (N:N)
CREATE TABLE Projeto_Participante (
    projeto_codigo VARCHAR(30) NOT NULL,
    participante_cpf VARCHAR(14) NOT NULL,
    funcao VARCHAR(50) NOT NULL,
    dataEntrada DATE NOT NULL,
    dataSaida DATE,
    PRIMARY KEY (projeto_codigo, participante_cpf),
    FOREIGN KEY (projeto_codigo) REFERENCES Projeto(codigo) ON DELETE CASCADE,
    FOREIGN KEY (participante_cpf) REFERENCES Participante(cpf) ON DELETE CASCADE
);

-- Tabela Producao Cientifica

CREATE TABLE Apoio_Financeiro (
    projeto_codigo VARCHAR(30) NOT NULL,
    id_financiamento INT NOT NULL,
    tipoVinculo VARCHAR(20) NOT NULL,
    valorDestinado DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (projeto_codigo, id_financiamento),
    FOREIGN KEY (projeto_codigo) REFERENCES Projeto(codigo) ON DELETE CASCADE,
    FOREIGN KEY (id_financiamento) REFERENCES Financiamento(id_financiamento) ON DELETE CASCADE
);

CREATE TABLE Producao_Autor (
    producao_id INT NOT NULL,
    participante_cpf VARCHAR(14) NOT NULL,
    PRIMARY KEY (producao_id, participante_cpf),
    FOREIGN KEY (producao_id) REFERENCES Producao_Cientifica(id_producao) ON DELETE CASCADE,
    FOREIGN KEY (participante_cpf) REFERENCES Participante(cpf) ON DELETE CASCADE
);

