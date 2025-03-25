Este arquivo implementa o **Scraper** que é responsável por extrair informações sobre produtos de um ecommerce (Kabum neste caso) e armazená-las no **DynamoDB**.

## Funcionalidade

- O **Puppeteer** é utilizado para acessar a página de hardware da Kabum e extrair informações de produtos.
- As informações extraídas incluem:
  - **Título**: Nome do produto.
  - **Preço**: Preço do produto.
  - **URL**: Link para o produto.
  - **Imagem**: Link da imagem do produto.
  - **Data da extração**: Data e hora em que o dado foi extraído.

- Os dados são armazenados na tabela `ProductsTable` do **DynamoDB**.

## Fluxo de Trabalho

1. **Lançamento do Puppeteer**:
   - O browser do Puppeteer é iniciado em modo headless.
   - A página do Kabum é carregada com o URL `'https://www.kabum.com.br/hardware'` e aguarda o carregamento da página.

2. **Acesso à Página e Extração de Dados**:
   - A página carrega e o script espera o seletor `.productCard` estar presente.
   - Uma vez encontrado, o script extrai até 3 produtos (com o índice menor que 3) da página.
   - Para cada produto, são extraídos os seguintes dados:
     - **Título**: Utiliza o seletor `.nameCard`.
     - **Preço**: Utiliza o seletor `.priceCard .priceCard__price--final`.
     - **Link**: Obtém o link do produto (dentro de uma tag `a`).
     - **Imagem**: Obtém o link da imagem do produto.
   - Todos esses dados são coletados e organizados em um objeto de produto.

3. **Armazenamento no DynamoDB**:
   - Os produtos extraídos são enviados para o **DynamoDB** utilizando o comando `BatchWriteItemCommand` da AWS SDK.
   - Os dados são salvos na tabela `ProductsTable`, que contém os seguintes atributos:
     - `id`: Identificador único para o produto.
     - `title`: Título do produto.
     - `price`: Preço do produto.
     - `url`: URL do produto.
     - `image`: URL da imagem do produto (se disponível).
     - `scrapedAt`: Data e hora de quando o produto foi extraído.

4. **Encerramento do Puppeteer**:
   - Após o processo de extração e armazenamento dos dados, o browser do Puppeteer é fechado.

## Dependências

- **Puppeteer**: Biblioteca para fazer o scraping e controlar o browser.
- **AWS SDK**: Para interação com o **DynamoDB** e salvar os dados extraídos.

## Erros e Exceções

Caso ocorra algum erro durante o processo de scraping ou salvamento dos dados, o erro será capturado e impresso no console.

Se o scraper não conseguir extrair produtos, será exibido o aviso:
```
Nenhum produto foi extraído.
```

## Como Executar

Este scraper pode ser executado localmente ou em um ambiente de **AWS Lambda**. Ao rodar localmente, você pode usar o comando:
```bash
npx ts-node src/functions/scraper/handler.ts
```

### Estrutura do Código

- **Lançamento do Browser**: Configuração do Puppeteer para rodar headless e acessar a URL.
- **Extração de Dados**: Utiliza `querySelectorAll` para pegar os produtos e os detalhes necessários.
- **Armazenamento no DynamoDB**: Usa o método `BatchWriteItemCommand` da AWS SDK para salvar os dados.
- **Fechamento do Browser**: Fecha o browser do Puppeteer após o processo de scraping.

