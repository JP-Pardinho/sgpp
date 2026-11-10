# SGPP — Sistema de Gerenciamento de Projetos de Pesquisa

Sistema web para gerenciamento acadêmico de **projetos de pesquisa**, **participantes (pesquisadores)**, **fontes de financiamento** e **produções científicas**, desenvolvido como projeto em grupo para a disciplina de **Banco de Dados 1**.

---

## 🛠️ Stack Tecnológica

* **Back-end:** ASP.NET Core Web API (.NET 8 / C#) + Swagger (`Swashbuckle.AspNetCore`)
* **Acesso a Dados:** `MySqlConnector` + micro-ORM `Dapper` (SQL nativo + padrão Repository)
* **Banco de Dados:** MySQL 8+
* **Front-end:** Next.js 16 (App Router) + React + TypeScript + Tailwind CSS

---

## ⚠️ Regras Críticas do Projeto (Disciplina de BD1)

1. **Sem Entity Framework Migrations:** é proibido o uso de EF Core / Migrations para gerar o banco. Toda a modelagem física (DDL e DML) é feita manualmente nos arquivos `backend/Database/schema.sql` e `backend/Database/seed.sql`.
2. **Consultas em SQL Nativo:** todas as queries (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`s) devem ser escritas manualmente dentro dos repositórios em `backend/Repositories/` usando `MySqlConnector` e `Dapper`.
3. **Arquitetura em Camadas no Back-end:**
   * `Controllers` (recebe/responde requisições HTTP) → `Services` (regras de negócio) → `Repositories` (acesso ao MySQL via interfaces) → `Models` (entidades).

---

## 📁 Estrutura do Repositório

```text
sgpp/
├── README.md
├── LICENSE
│
├── backend/                          # API ASP.NET Core 8 (C#)
│   ├── Database/                     # Scripts SQL manuais (substitui Migrations)
│   │   ├── schema.sql                # DDL: CREATE DATABASE, tabelas, PKs, FKs e restrições
│   │   └── seed.sql                  # DML: INSERTs iniciais para testes
│   ├── Models/                       # Entidades de domínio (Projeto, Participante, etc.)
│   ├── Repositories/                 # Acesso a dados com Dapper + MySqlConnector
│   │   └── Interfaces/               # Contratos para Injeção de Dependência
│   ├── Services/                     # Regras de negócio
│   ├── Controllers/                  # Endpoints REST expostos no Swagger
│   ├── Program.cs                    # Configuração de DI, CORS, Swagger e pipeline HTTP
│   ├── appsettingsExample.json       # Modelo da configuração (versionado)
│   ├── appsettings.json              # Configuração local com senha do MySQL (ignorado no Git)
│   └── sgpp.csproj                   # Dependências e SDK do projeto .NET
│
└── frontend/                         # Aplicação Next.js (TypeScript)
    ├── .env.exemple.local            # Modelo das variáveis de ambiente (versionado)
    ├── .env.local                    # Variáveis locais da máquina (ignorado no Git)
    ├── package.json
    └── src/
        ├── app/                      # Páginas e rotas (App Router)
        └── services/                 # Cliente HTTP (api.ts) e serviços por entidade
```

---

## 📋 Pré-requisitos

Antes de começar, instale na sua máquina:

* **Git**
* **.NET SDK 8.0** ([download](https://dotnet.microsoft.com/download/dotnet/8.0)) — verifique com `dotnet --version`
* **Node.js (v20+ LTS)** e **npm** (ou **pnpm**) — verifique com `node -v`
* **MySQL Server 8+** (instalado localmente ou via Docker) + cliente SQL (MySQL Workbench, DBeaver ou CLI `mysql`)

---

## 🚀 Como Rodar o Projeto Localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/JP-Pardinho/sistema-de-gerenciamento-de-projetos-de-pesquisa.git
cd sistema-de-gerenciamento-de-projetos-de-pesquisa
```

*(Caso utilize SSH: `git clone git@github.com:JP-Pardinho/sgpp.git`)*

---

### 2. Configurar o Banco de Dados (MySQL)

1. Certifique-se de que o serviço do MySQL está em execução na sua máquina.
2. Execute o script DDL [`backend/Database/schema.sql`](backend/Database/schema.sql) no seu cliente SQL (DBeaver, MySQL Workbench ou terminal) para criar o banco `sgpp_db` e as tabelas:
   ```bash
   mysql -u root -p < backend/Database/schema.sql
   ```
3. Se houver dados iniciais em [`backend/Database/seed.sql`](backend/Database/seed.sql), execute-o em seguida:
   ```bash
   mysql -u root -p < backend/Database/seed.sql
   ```

---

### 3. Configurar e Rodar o Back-end (`/backend`)

1. Entre na pasta do back-end:
   ```bash
   cd backend
   ```
2. Crie o seu arquivo `appsettings.json` a partir do modelo versionado:
   ```bash
   cp appsettingsExample.json appsettings.json
   ```
   *(No Windows PowerShell/CMD, use `copy appsettingsExample.json appsettings.json`.)*
3. Abra `backend/appsettings.json` e substitua `SEU_USUARIO` e `SUA_SENHA` pelas credenciais do seu MySQL local na chave `SgppConnection`:
   ```json
   "ConnectionStrings": {
     "SgppConnection": "Server=localhost;Port=3306;Database=sgpp_db;User=root;Password=SUA_SENHA;SslMode=Preferred;"
   }
   ```
4. Restaure os pacotes e execute a API:
   ```bash
   dotnet restore
   dotnet run
   ```
5. Observe no terminal a URL em que a API subiu (ex.: `Now listening on: http://localhost:5000`).
6. Acesse o **Swagger** no navegador para consultar e testar os contratos da API:
   ```text
   http://localhost:5000/swagger
   ```
   *(Ajuste a porta caso o `dotnet run` exiba outra no seu terminal.)*

---

### 4. Configurar e Rodar o Front-end (`/frontend`)

Em um **novo terminal**, na raiz do projeto:

1. Entre na pasta do front-end:
   ```bash
   cd frontend
   ```
2. Crie o arquivo `.env.local` a partir do modelo:
   ```bash
   cp .env.exemple.local .env.local
   ```
3. Abra `frontend/.env.local` e confirme se a URL aponta para a mesma porta exibida no terminal do back-end:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Instale as dependências e inicie o servidor de desenvolvimento:
   ```bash
   npm install
   npm run dev
   ```
   *(Caso utilize `pnpm`: `pnpm install && pnpm dev`.)*
5. Acesse a aplicação no navegador:
   ```text
   http://localhost:3000
   ```

---

## 🌿 Fluxo de Trabalho com Git (Branches da Equipe)

**Nunca faça alterações diretamente na branch `main`.** Cada integrante deve trabalhar em uma branch separada para a sua tarefa:

1. **Atualize sua `main` local antes de criar a branch:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Crie sua branch usando um nome descritivo:**
   * `feat/...` para novas funcionalidades (ex.: `feat/crud-participantes`, `feat/tela-projetos`)
   * `fix/...` para correções de bugs (ex.: `fix/schema-sql`)
   * `docs/...` para documentação
   ```bash
   git checkout -b feat/sua-funcionalidade
   ```

3. **Confira os arquivos modificados antes de commitar:**
   ```bash
   git status
   ```
   > ⚠️ **Atenção:** nunca versione `backend/appsettings.json`, `frontend/.env.local`, `bin/`, `obj/` ou `node_modules/` (já estão nos `.gitignore`, mas sempre confira).

4. **Faça commits pequenos e claros:**
   ```bash
   git add .
   git commit -m "feat: implementa repositorio e controller de participantes"
   ```

5. **Envie sua branch para o GitHub e abra um Pull Request (PR) para `main`:**
   ```bash
   git push -u origin feat/sua-funcionalidade
   ```

---

## 🧩 Guia Rápido para Implementar Novas Funcionalidades

### No Back-end (`/backend`)
1. **Banco de Dados:** se precisar alterar ou criar tabelas, atualize `Database/schema.sql` (e `Database/seed.sql` se necessário) e avise o time.
2. **Model (`Models/`):** crie ou complete a classe da entidade.
   > 💡 **Dica:** mantenha sempre um **construtor sem parâmetros** (`public MinhaEntidade() { }`) nas Models para que o Dapper e a desserialização JSON do ASP.NET Core funcionem corretamente.
3. **Repository (`Repositories/` e `Repositories/Interfaces/`):**
   * Defina a interface em `Repositories/Interfaces/` (ex.: `IParticipanteRepository.cs`).
   * Implemente em `Repositories/` recebendo `Func<MySqlConnection> createConnection` no construtor e escrevendo SQL nativo com `Dapper`.
4. **Service (`Services/`):** implemente as validações e regras de negócio chamando o repositório via interface.
5. **Injeção de Dependência (`Program.cs`):** registre o novo Repository e o novo Service com `builder.Services.AddScoped<...>()` em `backend/Program.cs`.
6. **Controller (`Controllers/`):** crie a classe herdando de `ControllerBase`, decorada com `[ApiController]` e `[Route("api/[controller]")]`, e teste no **Swagger**.

### No Front-end (`/frontend`)
1. **Service (`src/services/`):** crie o arquivo de serviço da entidade reutilizando `apiFetch` de `frontend/src/services/api.ts` (use `frontend/src/services/projetoServices.ts` como referência).
2. **Interface/Páginas (`src/app/`):** crie as rotas e componentes consumindo o serviço criado.

---

## 🛟 Problemas Comuns (Troubleshooting)

* **Erro de CORS no navegador ao chamar a API:**
  * Verifique se o back-end está rodando e se a origem `http://localhost:3000` está permitida na seção `Cors:AllowedOrigins` (ou no fallback do `Program.cs`).
* **`Failed to fetch` ou `404` no front-end:**
  * Confirme se a porta configurada em `frontend/.env.local` (`NEXT_PUBLIC_API_URL`) corresponde exatamente à porta exibida no terminal do `dotnet run`.
* **Erro ao conectar no MySQL:**
  * Verifique se o serviço do MySQL está ativo, se o banco `sgpp_db` foi criado via `schema.sql` e se usuário/senha em `backend/appsettings.json` estão corretos.
* **`Program.cs` lança exceção sobre `SgppConnection`:**
  * Você esqueceu de copiar `appsettingsExample.json` para `appsettings.json` dentro de `backend/` ou removeu a chave `"SgppConnection"`.
