Este arquivo implementa o **Handler** para obter os produtos armazenados na tabela `ProductsTable` do **DynamoDB**. Ele é responsável por realizar uma consulta (scan) na tabela e retornar a lista de produtos em formato JSON.

## Funcionalidade

- O **AWS SDK** é utilizado para interagir com o **DynamoDB**.
- A função executa uma consulta (`ScanCommand`) na tabela `ProductsTable` para obter todos os itens armazenados.
- Os dados extraídos incluem:
  - **ID**: Identificador único do produto.
  - **Título**: Nome do produto.
  - **Preço**: Preço do produto.
  - **URL**: Link para o produto.
  - **Imagem**: Link para a imagem do produto.
  - **Data de extração**: Data e hora de quando o dado foi extraído.

## Fluxo de Trabalho

1. **Execução do Scan no DynamoDB**:
   - A função utiliza o comando `ScanCommand` do **AWS SDK** para buscar todos os produtos da tabela `ProductsTable`.
   - O comando consulta a tabela para obter todos os itens e, em seguida, os processa.

2. **Processamento dos Dados**:
   - O comando `ScanCommand` retorna os itens encontrados na tabela `ProductsTable`.
   - Para cada item retornado, os dados são mapeados para um objeto contendo:
     - `id`: O ID do produto (extraído do campo `id`).
     - `title`: O título do produto (extraído do campo `title`).
     - `price`: O preço do produto (extraído do campo `price`).
     - `url`: O link para o produto (extraído do campo `url`).
     - `image`: O link da imagem do produto (extraído do campo `image`, se disponível).
     - `scrapedAt`: A data em que o produto foi extraído (extraído do campo `scrapedAt`).

3. **Retorno dos Produtos**:
   - A lista de produtos processados é retornada como uma resposta HTTP em formato JSON com o status 200, se a operação for bem-sucedida.
   - Caso haja algum erro durante o processo, um erro interno será retornado com o status 500 e a descrição do erro.

## Erros e Exceções

Caso ocorra algum erro durante a execução do comando `ScanCommand`, a função captura a exceção e retorna uma resposta com status 500 e uma mensagem de erro.

Se o **DynamoDB** não retornar dados ou se algum campo não estiver presente, o campo `image` é tratado como `null`.

## Como Executar

Este handler é executado automaticamente como parte do **AWS Lambda** quando a API é chamada através do **API Gateway**. Não é necessário rodá-lo localmente. No entanto, se você quiser testar localmente, pode utilizar o `serverless offline`.

### Estrutura do Código

- **Scan no DynamoDB**: Utiliza `ScanCommand` do **AWS SDK** para consultar a tabela `ProductsTable`.
- **Mapeamento dos Itens**: Processa os itens retornados para um formato consistente e adequado à resposta da API.
- **Retorno de Dados**: Retorna os dados em formato JSON, com o status adequado, conforme o sucesso ou falha da operação.

---