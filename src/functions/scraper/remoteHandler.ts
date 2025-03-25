import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { DynamoDBClient, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });

export const handler = async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  console.log('Acessando página do Kabum...');
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  );

  await page.goto('https://www.kabum.com.br/hardware', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  const products = await page.evaluate(() => {
    const items: any[] = [];
    const cards = document.querySelectorAll('.productCard');

    cards.forEach((card, index) => {
      if (index < 3) {
        const title = card.querySelector('.nameCard')?.textContent?.trim() ?? '[sem título]';
        const priceWhole = card.querySelector('.priceCard .priceCard__price--final')?.textContent?.trim() ?? '[sem preço]';
        const link = card.querySelector('a')?.getAttribute('href') ?? '';
        const image = card.querySelector('img')?.getAttribute('src') ?? '';

        items.push({
          id: String(index + 1),
          title,
          price: priceWhole,
          url: `https://www.kabum.com.br${link}`,
          image,
          scrapedAt: new Date().toISOString(),
        });
      }
    });

    return items;
  });

  console.log('Dados extraídos:', products);

  if (products.length > 0) {
    const command = new BatchWriteItemCommand({
      RequestItems: {
        ProductsTable: products.map(product => ({
          PutRequest: {
            Item: {
              id: { S: product.id },
              title: { S: product.title },
              price: { S: product.price },
              url: { S: product.url },
              scrapedAt: { S: product.scrapedAt },
              ...(product.image && { image: { S: product.image } }),
            }
          }
        }))
      }
    });

    console.log('Enviando para o DynamoDB...');
    await client.send(command);
    console.log('Dados salvos!');
  } else {
    console.warn('Nenhum produto foi extraído.');
  }

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Scraping completed and data saved!' }),
  };
};
