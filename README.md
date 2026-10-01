# Sistema-de-Gerenciamento-de-Projetos-de-Pesquisa

**Status:** Em desenvolvimento.

---

## Feito com

-   PHP
-   MySQL
-   Bootstrap 5
-   HTML / CSS / JS

---

## Como Rodar o Projeto

1.  **Pré-requisitos:**
    -   Você precisa ter o [PHP](https://www.php.net/downloads) e o [MySQL](https://dev.mysql.com/downloads/installer/) instalados na sua máquina.

2.  **Clone o Repositório:**
    -   Abra seu terminal ou Git Bash e clone este projeto.
      
3.  **Banco de Dados:**
    -   Crie um banco de dados no seu MySQL com o nome `mscode_estoque2025`.
    -   Importe o arquivo `criar-tabelas.sql` para dentro desse banco de dados.
    -   Ajuste suas credenciais (usuário e senha) no arquivo de conexão `App/Database/Query.php`.

4.  **Inicie o Servidor:**
    -   Ainda no terminal, na raiz do projeto, execute o seguinte comando:
    ```bash
    php -S localhost:8081 -t public
    ```
    -   *Este comando inicia o servidor do PHP na porta `8081` e define a pasta `public` como o diretório raiz, uma prática recomendada para segurança.*

5.  **Acesso:**
    -   Abra seu navegador e acesse: **http://localhost:8081**
