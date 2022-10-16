'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const ProductsTableName = process.env.PRODUCTS_TABLE;
const StocksTableName = process.env.STOCKS_TABLE;

const { DEFAULT_HEADERS } = require('./common');

const getProduct = async (id) => {
    return await db
        .get({
            TableName: ProductsTableName,
            Key: {
                id,
            },
        })
        .promise();
};

const getStock = async (product_id) => {
    return await db
        .get({
            TableName: StocksTableName,
            Key: {
                product_id,
            },
        })
        .promise();
};

const getProductById = async (event) => {
    if (!event || !event.pathParameters) {
        return {
            statusCode: 400,
            headers: DEFAULT_HEADERS,
            body: 'Please provide ID',
        };
    }

    const id = event.pathParameters.id;

    const [product, stock] = await Promise.all([getProduct(id), getStock(id)]);

    if (product.Item && stock.Item) {
        const item = { ...product.Item, count: stock.Item.count || 0 };

        return {
            statusCode: 200,
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({ product: item }),
        };
    } else {
        return {
            statusCode: 404,
            headers: DEFAULT_HEADERS,
            body: 'Product not found',
        };
    }
};

module.exports = async (event) => {
    try {
        return await getProductById(event);
    } catch {
        return {
            statusCode: 500,
            headers: DEFAULT_HEADERS,
            body: 'Something goes wrong.',
        };
    }
};
