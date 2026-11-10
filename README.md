SGPP - FEITO COM .NET E C#


📁 SGPP.Api/                  # Raiz do projeto .NET
│
├── 📁 Database/              # ➔ Substitui as Migrations
│   ├── schema.sql            # Script DDL com CREATE TABLES, PKs, FKs e restrições.
│   └── seed.sql              # Script DML com inserts iniciais para testes.
│
├── 📁 Models/                # ➔ Representação do Diagrama de Classes
│   ├── Projeto.cs            
│   ├── Participante.cs       
│   ├── Financiamento.cs      
│   └── ProducaoCientifica.cs 
│
├── 📁 Repositories/          # ➔ Onde o SQL vai morar (Acesso a Dados)
│   ├── 📁 Interfaces/        # Contratos para injeção de dependência (ex: IProjetoRepository)
│   ├── ProjetoRepository.cs
│   └── ParticipanteRepository.cs
│
├── 📁 Services/              # ➔ Onde as Regras de Negócio (RN) vão morar
│   ├── ProjetoService.cs
│   └── VinculoService.cs
│
├── 📁 Controllers/           # ➔ Recebe as requisições do Frontend (Dashboard)
│   ├── ProjetosController.cs
│   └── ParticipantesController.cs
│
├── Program.cs                # Configuração da injeção de dependência e conexão
└── appsettings.json          # Onde ficará a string de conexão com o MySQL