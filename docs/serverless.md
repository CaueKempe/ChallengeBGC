O arquivo `serverless.ts` configura e gerencia a infraestrutura do serviço utilizando o **Serverless Framework**. Ele define as funções, eventos, plugins, permissões e recursos necessários para a implementação de um serviço de scraping que armazena dados no **DynamoDB** e expõe esses dados através de uma **API**.

## Visão Geral

- **Serviço**: `scraper-service`
- **Framework**: Serverless Framework (versão 3)
- **Funções**:
  - **scraper**: Realiza o scraping dos produtos e os armazena no DynamoDB.
  - **getProducts**: Retorna os produtos armazenados no DynamoDB via API.
- **Recursos**:
  - **DynamoDB**: Usado para armazenar os dados extraídos.

## Configuração do Provider

### Provedor de Nuvem

- **name**: `aws`
- **runtime**: `nodejs18.x`
- **arquitetura**: `x86_64`
- **região**: `us-east-1`
- **memória**: `1769 MB`
- **tempo limite**: `30 segundos`

### Variáveis de Ambiente

- **NODE_OPTIONS**: Configurações de depuração e rastreamento de erros.
- **AWS_NODEJS_CONNECTION_REUSE_ENABLED**: Habilita a reutilização de conexões do AWS SDK.

### IAM Role

- O IAM Role permite o acesso ao DynamoDB com as permissões de:
  - `dynamodb:PutItem`
  - `dynamodb:BatchWriteItem`
  - `dynamodb:Scan`
  
Essas permissões permitem que o scraper escreva e leia da tabela `ProductsTable`.

## Funções

### `scraper`

Esta função é responsável pelo scraping de dados de e-commerce (no caso, a página de produtos do Kabum), extraindo informações e armazenando no DynamoDB.

- **Handler**: `src/functions/scraper/remoteHandler.handler`
- **Evento**: Um endpoint HTTP do tipo **POST** na URL `/scraper` é exposto pelo **API Gateway**.

### `getProducts`

Esta função expõe uma API GET que retorna os produtos armazenados no DynamoDB. 

- **Handler**: `src/functions/getProducts/handler.handler`
- **Evento**: Um endpoint HTTP do tipo **GET** na URL `/products` é exposto pelo **API Gateway**.

## Pacotes e Exclusões

A configuração do `package` garante que as dependências não essenciais (como o Puppeteer e o Chromium) não sejam empacotadas na função Lambda, já que essas bibliotecas não são necessárias para a execução no ambiente Lambda.

- **Exclusões**:
  - `node_modules/puppeteer/**`
  - `node_modules/puppeteer-core/**`
  - `node_modules/@sparticuz/chromium/**`
  
Esses pacotes são pesados demais para o ambiente Lambda e não são necessários lá, pois o scraping é feito de forma local.

## Configuração do Esbuild

O **esbuild** é utilizado para empacotar o código de forma eficiente e minificada.

- **Opções**:
  - **bundle**: O código é empacotado em um único arquivo.
  - **minify**: O código é minificado para reduzir o tamanho.
  - **target**: O código é compilado para compatibilidade com o Node.js 18.x.

## Recursos Adicionais

### DynamoDB

O arquivo configura a criação da tabela `ProductsTable` no **DynamoDB**.

- **Nome da Tabela**: `ProductsTable`
- **Definição de Atributos**:
  - `id` do tipo `S` (String)
- **Chave Primária**:
  - A chave primária é o `id`, com o tipo `HASH`.
- **Modo de Faturamento**: `PAY_PER_REQUEST`

Este recurso é utilizado tanto pela função `scraper` para armazenar os dados quanto pela função `getProducts` para consultar os dados.
