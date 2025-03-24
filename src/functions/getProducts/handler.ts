import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

export const handler = async () => {
  const result = await dynamoDb
    .scan({
      TableName: "ProductsTable",
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
};