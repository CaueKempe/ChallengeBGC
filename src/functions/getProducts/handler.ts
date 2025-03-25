import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });

export const handler = async () => {
  try {
    const command = new ScanCommand({
      TableName: 'ProductsTable'
    });

    const response = await client.send(command);

    const products = response.Items?.map((item) => ({
      id: item.id.S,
      title: item.title.S,
      price: item.price.S,
      url: item.url.S,
      image: item.image?.S ?? null,
      scrapedAt: item.scrapedAt.S
    })) || [];

    return {
      statusCode: 200,
      body: JSON.stringify(products)
    };
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Erro interno",
        error: error instanceof Error ? error.message : "Unknown error"
      })
    };
  }
};
