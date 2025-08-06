# Instalação no Windows

## Pré-requisitos

1. **Node.js 18 ou superior**
   - Baixe em: https://nodejs.org/
   - Escolha a versão LTS (recomendada)
   - Durante a instalação, marque "Add to PATH"

2. **Git (opcional, mas recomendado)**
   - Baixe em: https://git-scm.com/downloads
   - Use as configurações padrão durante a instalação

3. **PostgreSQL (se usar banco de dados)**
   - Baixe em: https://www.postgresql.org/download/windows/
   - Durante a instalação, anote a senha do usuário `postgres`

## Passo a Passo

### 1. Baixar o Projeto

**Opção A: Via Git (recomendado)**
```bash
git clone [URL_DO_SEU_REPOSITORIO]
cd seo-rewriter
```

**Opção B: Download ZIP**
- Baixe o arquivo ZIP do projeto
- Extraia para uma pasta (ex: `C:\seo-rewriter`)
- Abra o Command Prompt ou PowerShell na pasta

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
```bash
copy .env.example .env
```

2. Edite o arquivo `.env` com suas configurações:
```
# APIs de IA (escolha uma ou ambas)
OPENAI_API_KEY=sua_chave_openai_aqui
GEMINI_API_KEY=sua_chave_gemini_aqui

# Banco de dados (se usar PostgreSQL local)
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/seo_rewriter

# Ambiente
NODE_ENV=development
```

### 4. Configurar Banco de Dados (Opcional)

Se quiser usar banco de dados local:

```bash
# Criar banco de dados
createdb seo_rewriter

# Executar migrations
npm run db:push
```

### 5. Executar a Aplicação

```bash
npm run dev
```

A aplicação estará disponível em: http://localhost:5000

## Configuração de APIs

### OpenAI API Key
1. Acesse: https://platform.openai.com/
2. Faça login ou crie uma conta
3. Vá em "API Keys" → "Create new secret key"
4. Copie a chave e cole no arquivo `.env`

### Gemini API Key
1. Acesse: https://aistudio.google.com/
2. Faça login com conta Google
3. Clique em "Get API Key"
4. Copie a chave e cole no arquivo `.env`

## Solução de Problemas

### Erro: 'node' não é reconhecido
- Reinstale o Node.js marcando "Add to PATH"
- Reinicie o Command Prompt/PowerShell

### Erro: npm install falha
```bash
# Limpar cache
npm cache clean --force

# Tentar novamente
npm install
```

### Erro de porta em uso
- Mude a porta no arquivo `server/index.ts`
- Ou feche outros programas usando a porta 5000

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme a string de conexão no `.env`
- Teste a conexão: `psql -U postgres -d seo_rewriter`

## Scripts Disponíveis

```bash
# Desenvolvimento (recarregamento automático)
npm run dev

# Build para produção
npm run build

# Executar versão de produção
npm start

# Migrations do banco
npm run db:push

# Verificar tipos TypeScript
npm run type-check
```

## Estrutura do Projeto

```
seo-rewriter/
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Tipos compartilhados
├── package.json     # Dependências
├── .env            # Configurações (criar)
└── README.md       # Documentação
```

## Suporte

Em caso de problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme as variáveis de ambiente no `.env`
3. Consulte os logs no terminal
4. Reinicie a aplicação com `npm run dev`