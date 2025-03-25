
---
# Challenge BGC - Scraper Service

## Descrição

Este é um serviço de scraping utilizando Puppeteer, implementado com **Serverless Framework** para ser executado na AWS. O serviço realiza scraping de produtos em sites como Kabum, armazena os dados no **DynamoDB** e expõe uma API para recuperar os produtos via **AWS API Gateway**.

## Estrutura do Projeto

A arquitetura do projeto é baseada em uma aplicação serverless, com funções separadas para realizar o scraping, armazenar dados e recuperar produtos armazenados.

### Estrutura de diretórios:

```
CHALLENGE-BGC
│
├── .serverless/                  # Arquivos gerados após o deploy
├── node_modules/                 # Dependências do projeto
├── src/
│   ├── functions/
│   │   ├── getProducts/          # Função para recuperar produtos
│   │   │   └── handler.ts        # Lógica da função getProducts
│   │   └── scraper/              # Função para realizar o scraping
│   │       ├── handler.ts        # Lógica de scraping (local)
│   │       └── remoteHandler.ts  # Lógica de scraping (para AWS)
├── libs/                         # Bibliotecas auxiliares
├── .gitignore                    # Arquivos a serem ignorados pelo git
├── README.md                     # Documentação do projeto
├── serverless.ts                 # Configuração do Serverless Framework
├── package.json                  # Dependências e scripts do projeto
└── tsconfig.json                 # Configuração do TypeScript
```

## Dependências

O projeto utiliza as seguintes dependências:

- `puppeteer-core` - Para realizar o scraping na web.
- `@sparticuz/chromium` - Fornece o binário do Chromium necessário para rodar o Puppeteer na AWS Lambda.
- `@aws-sdk/client-dynamodb` - SDK da AWS para interagir com o DynamoDB.
- `serverless` - Framework para deploy e gestão de funções AWS Lambda.
- `serverless-esbuild` - Plugin para empacotar o código TypeScript.
- `serverless-offline` - Para emular a API Gateway localmente.

## Como Rodar o Projeto

### 1. Pré-requisitos

- Node.js (>= 18.0.0)
- AWS CLI configurado com credenciais
- Serverless Framework instalado globalmente (`npm install -g serverless`)

### 2. Instalar Dependências

Execute o seguinte comando para instalar as dependências:

```bash
npm install
```

### 3. Configuração do DynamoDB

Certifique-se de que a tabela do DynamoDB `ProductsTable` está criada corretamente na AWS. A tabela é criada automaticamente pelo Serverless durante o deploy, mas você pode configurar manualmente, se necessário.

### 4. Executando Localmente (Modo Offline)

Para rodar a API localmente com o **Serverless Offline**, use o comando abaixo:

```bash
npm run offline
```

### 5. Deploy na AWS

Para realizar o deploy na AWS, execute:

```bash
npm run deploy
```

O comando irá empacotar o código e subir a aplicação no AWS Lambda, criando as funções necessárias e o API Gateway.

### 6. Testar o Scraper

Após o deploy, você pode enviar uma requisição **POST** para o endpoint `/scraper` para acionar o scraper e coletar dados dos produtos. A função será executada e os dados serão salvos no DynamoDB.

### 7. Recuperar Produtos

Você pode recuperar os produtos armazenados no DynamoDB enviando uma requisição **GET** para o endpoint `/products`.

## Funções

### scraper

A função `scraper` realiza o scraping de produtos no site Kabum, extraindo o título, preço, URL e imagem dos produtos. Os dados extraídos são enviados para o DynamoDB.

- **Endpoint:** `/scraper`
- **Método HTTP:** `POST`

### getProducts

A função `getProducts` recupera os produtos armazenados na tabela DynamoDB e retorna em formato JSON.

- **Endpoint:** `/products`
- **Método HTTP:** `GET`

## Arquivos Importantes

### serverless.ts

Configuração do **Serverless Framework**, onde são definidos os recursos da AWS (funções Lambda, API Gateway e DynamoDB). O arquivo também inclui as permissões necessárias para que as funções possam interagir com o DynamoDB.

### scraper/remoteHandler.ts

Função que é executada na AWS Lambda. Utiliza o Puppeteer para acessar e extrair dados dos produtos do Kabum e envia esses dados para o DynamoDB.

### scraper/handler.ts

Função similar à `remoteHandler.ts`, mas que pode ser executada localmente com `puppeteer`. Essa função é útil para testar o scraper antes de rodar na AWS.

### getProducts/handler.ts

Função que acessa o DynamoDB para recuperar os produtos armazenados e retorna esses dados via API Gateway.

## Configuração de Permissões

No arquivo `serverless.ts`, a função scraper tem permissões para interagir com o DynamoDB. Certifique-se de que a política de IAM definida permita que a função Lambda tenha acesso à tabela `ProductsTable`.

## Troubleshooting

1. **Erro de tempo de execução do Puppeteer**: Quando estiver rodando na AWS, o Puppeteer pode ter problemas com a execução em headless mode devido a problemas com a versão do Chromium. Certifique-se de usar o pacote `@sparticuz/chromium` e configurá-lo corretamente, como mostrado em `remoteHandler.ts`.
    
2. **Timeouts ou lentidão**: As funções Lambda têm um limite de tempo de execução de 15 minutos. Se o scraping demorar mais que isso, você pode aumentar o tempo limite na configuração do `serverless.ts`.
    
3. **Permissões do DynamoDB**: Verifique se as permissões da função Lambda permitem o acesso correto à tabela do DynamoDB.
    

## Licença

MIT - Veja o arquivo LICENSE para mais detalhes.

---