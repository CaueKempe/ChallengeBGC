import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

chromium.setGraphicsMode = false;

const client = new DynamoDBClient({});

export const handler = async () => {
  let browser = null;

  try {
    console.log("Lançando o navegador...");
    browser = await puppeteer.launch({
      args: [...chromium.args, '--disable-gpu', '--single-process'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless === 'new' ? true : chromium.headless,
      ignoreHTTPSErrors: true,
    });

    console.log("Abrindo nova página...");
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36');
    
    console.log("Acessando página...");
    await page.goto("https://www.amazon.com.br/gp/bestsellers", {
      waitUntil: "networkidle2",
      timeout: 10000
    });

    const html = await page.content();
    console.log("HTML parcial:", html.slice(0, 1000));

    console.log("Esperando seletor...");
    await page.waitForSelector('.zg-grid-general-faceout', { timeout: 5000 });

    console.log("Extraindo dados...");
    const products = await page.evaluate(() => {
      const items: any[] = [];
      document.querySelectorAll('.zg-grid-general-faceout').forEach((el, index) => {
        if (index < 3) {
          const title = el.querySelector('._cDEzb_p13n-sc-css-line-clamp-1_1Fn1y')?.textContent?.trim();
          const price = el.querySelector('.p13n-sc-price')?.textContent?.trim();
          if (title && price) {
            items.push({
              id: String(index + 1),
              title,
              price,
              scrapedAt: new Date().toISOString()
            });
          }
        }
      });
      return items;
    });

    if (products.length > 0) {
      const command = new BatchWriteItemCommand({
        RequestItems: {
          ProductsTable: products.map(product => ({
            PutRequest: {
              Item: {
                id: { S: product.id },
                title: { S: product.title },
                price: { S: product.price },
                scrapedAt: { S: product.scrapedAt },
              }
            }
          }))
        }
      });

      console.log("Salvando no DynamoDB...");
      await client.send(command);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Products scraped and saved!",
        count: products.length
      }),
    };
  } catch (error) {
    console.error("Scraper error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Scraping failed",
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  } finally {
    if (browser) await browser.close();
  }
};
