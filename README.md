
# Challenge BGC - Scraper Service

## Descrição

Este é um serviço de scraping utilizando Puppeteer, implementado com **Serverless Framework** para ser executado na AWS. O serviço realiza scraping de produtos em sites como Kabum, armazena os dados no **DynamoDB** e expõe uma API para recuperar os produtos via **AWS API Gateway**.

## Estrutura do Projeto

A arquitetura do projeto é baseada em uma aplicação serverless com funções separadas para realizar o scraping, armazenar dados e recuperar produtos armazenados.

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

# Minha esperiência:

Minha Experiência

Durante o desenvolvimento deste projeto, enfrentei algumas dificuldades e desafios técnicos que exigiram ajustes nas dependências e no fluxo de trabalho para obter o scraper funcionando corretamente.

## 1. Adaptação das Dependências

A integração do Puppeteer com o AWS Lambda foi um dos maiores desafios. Embora o Puppeteer funcione bem localmente, quando executado na AWS, ele exige uma configuração mais específica, principalmente no que diz respeito à versão do Chromium utilizado. Para resolver esse problema, utilizei o pacote @sparticuz/chromium, que fornece a versão adequada do Chromium para o ambiente Lambda. Mesmo com essa adaptação, encontrei alguns desafios na execução do scraper na AWS devido a configurações de headless mode e permissões do Puppeteer. Embora eu tenha seguido a documentação, algumas configurações adicionais para garantir a execução do Chromium de forma correta na nuvem foram necessárias.

## 2. Problemas com o Remote Handler

O remoteHandler.ts, que foi desenvolvido para ser executado diretamente no AWS Lambda, não funcionou como esperado. Ao executar a função, o log não retornava erros claros, apenas indicava um timeout. Isso dificultou bastante a identificação da origem do problema, pois não havia um erro explícito ou mensagem de falha que eu pudesse utilizar para ajustar a implementação. Tentei ajustar os tempos de execução e as configurações da função Lambda, mas o problema persiste até o momento.

## 3. Scraping na Amazon e Mercado Livre

Minha primeira tentativa de scraping foi com o site da Amazon, no qual, apesar de ter conseguido configurar o scraping localmente, a Amazon acabou aplicando um throttling, bloqueando minhas requisições após algum tempo de execução. Tentei contornar isso, mas o bloqueio foi recorrente, o que me fez buscar outras fontes de dados.

Em seguida, tentei realizar o scraping no Mercado Livre, mas, ao executar o scraper localmente, também encontrei problemas semelhantes, como bloqueios por parte do Mercado Livre após algumas requisições. Isso ocorreu apesar de ajustes na configuração do Puppeteer e no comportamento das requisições, o que dificultou o avanço com esse site.

## 4. Sucesso com o Kabum

Finalmente, consegui realizar o scraping com sucesso no site Kabum, obtendo os dados dos produtos corretamente e conseguindo enviá-los para o DynamoDB. No entanto, a versão do scraper que foi implementada via ads não funcionou como esperado. Tentei ajustar a configuração mas não obtive sucesso. No entanto, o scraper local acessando diretamente os produtos do Kabum foi bem-sucedido e funcionou conforme o esperado.

## Conclusão

Embora eu tenha encontrado diversos obstáculos, como bloqueios de scraping e problemas com o ambiente da AWS, consegui superar esses desafios e avançar com a maior parte do projeto. Infelizmente, o remoteHandler.ts ainda não está funcionando, e o scraping em alguns sites populares foi prejudicado por bloqueios. No entanto, o sistema está funcional para realizar o scraping de produtos do Kabum, e os dados estão sendo corretamente armazenados no DynamoDB e expostos pela API.

---

# Minha Experiência com a Stack

Antes deste projeto eu não tinha experiência prévia com a stack que foi utilizada. Embora já tivesse trabalhado com TypeScript e Node.js em outros projetos, essa foi a minha primeira vez lidando com a combinação de AWS, Serverless Framework, DynamoDB, e o uso de funções Lambda para backend. Todo o aprendizado e desenvolvimento desse projeto foram feitos em intervalos(cerca de 30 minutos) entre minhas responsabilidades diárias, como trabalho, faculdade, atletica e projetos pessoais.

O fato de não conhecer as ferramentas específicas para a construção de sistemas serverless me desafiou a aprender e adaptar rapidamente. Apesar de ter enfrentado algumas dificuldades, principalmente em relação à configuração do Serverless Framework e à execução do scraper na AWS, essa experiência me proporcionou um aprendizado valioso, especialmente no que diz respeito à integração de diferentes serviços da AWS, como o API Gateway e o DynamoDB.

## Backend em TypeScript

Embora essa não seja a minha primeira experiência com backend em TypeScript, posso destacar que foi o meu primeiro backend utilizando TypeScript sem a arquitetura MVC. Isso significou um novo desafio, pois tive que pensar em como estruturar o código de maneira modular, sem depender de um framework de MVC tradicional. Foi uma ótima oportunidade para aprender boas práticas de organização de código, como a separação de responsabilidades e a criação de funções independentes para tarefas específicas, como o scraper e o acesso ao banco de dados.

Esse foi um passo importante no meu desenvolvimento, pois me forçou a explorar soluções mais flexíveis e adaptáveis para as necessidades do projeto, sem a estrutura rígida que o MVC costuma proporcionar.

## Aprendizado Contínuo

O aprendizado foi constante ao longo do processo. A cada novo desafio, busquei soluções por meio de documentação, tutoriais e experiências de outras pessoas. O Serverless Framework, por exemplo, foi algo completamente novo para mim, mas foi essencial para automatizar a criação e o deploy das funções na AWS. As dificuldades encontradas, como o manuseio do Puppeteer em ambiente serverless, exigiram pesquisas contínuas e adaptação do código até que fosse possível ter tudo funcionando de forma estável.

Apesar de todas as dificuldades, cada avanço no projeto foi uma grande satisfação e uma chance de aprender algo novo, o que se tornou uma experiência gratificante no final.

## Licença

MIT - Veja o arquivo LICENSE para mais detalhes.

---