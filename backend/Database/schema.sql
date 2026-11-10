CREATE DATABASE sgpp_db;
USE sgpp_db;

-- Tabela Participante
CREATE TABLE Participante (
    cpf VARCHAR(14) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    emailInstitucional VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL
);

-- Tabela Projeto
CREATE TABLE Projeto (
    codigo CHAR(10) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao text,
    situacao VARCHAR(50) NOT NULL,
    dataInicio DATETIME,
    dataFim DATETIME
);

CREATE TABLE Financiamento (
    id_financiamento INT PRIMARY KEY,
    agenciaFinanciadora VARCHAR(100) NOT NULL,
    tipoFomento VARCHAR(50) NOT NULL,
    valorTotal DECIMAL(15,2) NOT NULL,
    periodoVigencia VARCHAR(50) NOT NULL
);



-- Tabela Associativa Projeto_Participante (N:N)
CREATE TABLE Projeto_Participante (
    projeto_codigo VARCHAR(50),
    participante_cpf VARCHAR(14),
    funcao VARCHAR(50) NOT NULL,
    dataEntrada DATE NOT NULL,
    dataSaida DATE,
    PRIMARY KEY (projeto_codigo, participante_cpf),
    FOREIGN KEY (projeto_codigo) REFERENCES Projeto(codigo) ON DELETE CASCADE,
    FOREIGN KEY (participante_cpf) REFERENCES Participante(cpf) ON DELETE CASCADE
);

-- Tabela Producao Cientifica
CREATE TABLE Producao_Cientifica (
    id_producao INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(50),
    tipoProducao VARCHAR(50),
    anoPublicacao INT,
    meioDivulgacao VARCHAR(50),
    projeto_codigo VARCHAR(10),
    FOREIGN KEY (projeto_codigo) REFERENCES Projeto(codigo) ON DELETE CASCADE
);

CREATE TABLE Apoio_Financeiro (
    projeto_codigo VARCHAR(10) PRIMARY KEY,
    id_financiamento INT PRIMARY KEY,
    tipoVinculo VARCHAR(50) NOT NULL,
    FOREIGN KEY (projeto_codigo) REFERENCES Projeto(codigo) ON DELETE CASCADE,
    FOREIGN KEY (id_financiamento) REFERENCES Financiamento(id_financiamento) ON DELETE CASCADE
);

CREATE TABLE Producao_Autor (
    producao_id INT,
    participante_cpf CHAR(11),
    PRIMARY KEY (producao_id, participante_cpf),
    FOREIGN KEY (producao_id) REFERENCES Producao_Cientifica(id_producao) ON DELETE CASCADE,
    FOREIGN KEY (participante_cpf) REFERENCES Participante(cpf) ON DELETE CASCADE
);

