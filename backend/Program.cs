using MySqlConnector;
using Microsoft.OpenApi.Models;
using sgpp.Repositories;
using sgpp.Repositories.Interfaces;
using sgpp.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Leitura e validação da Connection String do MySQL (appsettings.json)
var connectionString = builder.Configuration.GetConnectionString("SgppConnection")
    ?? throw new InvalidOperationException("Connection string 'SgppConnection' não encontrada em appsettings.json.");

// Fábrica de conexões MySqlConnector para uso seguro nos Repositórios (Dapper + SQL nativo)
builder.Services.AddSingleton<Func<MySqlConnection>>(_ => () => new MySqlConnection(connectionString));

// 2. Registro de Repositórios e Serviços (Injeção de Dependência)
builder.Services.AddScoped<IProjetoRepository, ProjetoRepository>();
builder.Services.AddScoped<ProjetoServices>();
builder.Services.AddScoped<IParticipanteRepository, ParticipanteRepository>();
builder.Services.AddScoped<ParticipanteServices>();
builder.Services.AddScoped<IFinanciamentoRepository, FinanciamentoRepository>();
builder.Services.AddScoped<FinanciamentoServices>();
builder.Services.AddScoped<IProducaoRepository, ProducaoRepository>();
builder.Services.AddScoped<ProducaoServices>();
builder.Services.AddScoped<IConsultaRepository, ConsultaRepository>();
builder.Services.AddScoped<ConsultaServices>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<DashboardServices>();
// Exemplo de como registrar conforme as interfaces forem implementadas:
// builder.Services.AddScoped<VinculoService>();

// 3. Configuração de CORS para o Front-end Next.js (localhost:3000)
const string corsPolicyName = "SgppFrontendPolicy";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000", "http://127.0.0.1:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 4. Controllers + Swagger/OpenAPI
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SGPP API",
        Version = "v1",
        Description = "API do Sistema de Gerenciamento de Projetos de Pesquisa (Banco de Dados 1 - Dapper + MySqlConnector)"
    });
});

var app = builder.Build();

// 5. Pipeline HTTP (Swagger sempre ativo para facilitar os testes locais)
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Erro não tratado em {Method} {Path}", context.Request.Method, context.Request.Path);
        if (!context.Response.HasStarted)
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                mensagem = ex.Message,
                tipo = ex.GetType().Name
            });
        }
    }
});

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "SGPP API v1");
    options.RoutePrefix = "swagger"; // Acesso em http://localhost:5000/swagger
});

app.UseCors(corsPolicyName);
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/health", async (Func<MySqlConnection> createConnection) =>
{
    await using var conn = createConnection();
    await conn.OpenAsync();
    return Results.Ok(new { status = "ok", banco = conn.Database });
});

app.Run();