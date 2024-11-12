# API

Esta API permite criar e gerenciar clubes de leitura, adicionar livros a clubes e registrar opiniões. Utiliza autenticação JWT e Prisma para persistência em banco de dados SQL.

## Funcionalidades

1. **Autenticação**: Registro e login de usuários com tokens JWT para acesso autenticado.
2. **Gestão de Usuários**: CRUD para gerenciar dados do usuário.
3. **Gestão de Clubes de Leitura**: CRUD para criar e gerenciar clubes de leitura.
4. **Livros e Opiniões**: Adicionar livros aos clubes e registrar opiniões e avaliações.

## Tecnologias Usadas

- **Node.js e Express** para configuração do servidor e criação de rotas.
- **Prisma ORM** para definição de modelos e comunicação com o banco de dados SQL.
- **JWT** para autenticação de usuários.
- **Zod** para validação de dados de entrada.

## Pré-requisitos

- **Node.js** 
- Banco de dados **MySQL** 
- **Prisma** CLI instalada globalmente para migrações.

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/SamsSouza22/DesafioTecnico.git
   cd apps/backend
2. Instale as dependências:
   ```bash
   npm install
3. Configure as variáveis de ambiente. Crie um arquivo .env na pasta backend e defina as seguintes variáveis:
   ```bash
   DATABASE_URL=
   JWT_SECRET=
4. Configure o banco de dados e rode as migrações do Prisma:
   ```bash
   npx prisma migrate dev
5. Inicie o servidor
   ```bash
   npm start
## Uso

### Autenticação
- **Login**: `POST /api/auth`
  - Autentica o usuário e retorna um token JWT. Necessário enviar um JSON com `username` e `password`.

### Gestão de Usuários
- **Criar Usuário**: `POST /api/user`
  - Cria um novo usuário. Requer `name`, `password`, e `email`.
  
- **Consultar Usuário**: `GET /api/user/:id`
  - Retorna os dados do usuário especificado pelo `id`.

- **Atualizar Usuário**: `PUT /api/user/:id`
  - Atualiza os dados do usuário. Campos editáveis: `username`, `email` e `password`.

- **Deletar Usuário**: `DELETE /api/user/:id`
  - Remove o usuário especificado.

### Gestão de Clubes de Leitura
- **Criar Clube**: `POST /api/club`
  - Cria um novo clube de leitura. Necessário informar `name`, `description` e `creatorId`.

- **Consultar Clube**: `GET /api/club/:id`
  - Retorna os dados do clube de leitura pelo `id`.

- **Atualizar Clube**: `PUT /api/club/:id`
  - Permite atualizar dados do clube (ex.: `name`, `description`).

- **Deletar Clube**: `DELETE /api/club/:id`
  - Remove o clube especificado.

### Livros e Opiniões
- **Adicionar Livro ao Clube**: `POST /api/book/:id`
  - Adiciona um livro a um clube específico. Requer `creatorId`,`title`, `autor`, e `yearPublication`.

- **Registrar Opinião sobre o Livro**: `POST /api/:clubId/books/:bookId/opinions`
  - Permite registrar uma avaliação e comentário para um livro em um clube. Requer `userId`,`rating` (1-5) e `text`.
