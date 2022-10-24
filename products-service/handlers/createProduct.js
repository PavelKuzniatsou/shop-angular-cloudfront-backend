'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const ProductsTableName = process.env.PRODUCTS_TABLE;
const StocksTableName = process.env.STOCKS_TABLE;

const { DEFAULT_HEADERS } = require('./common');

const putProduct = async (item) => {
    return await db
        .put({
            TableName: ProductsTableName,
            Item: item,
        })
        .promise();
};

const putStock = async (item) => {
    return await db
        .put({
            TableName: StocksTableName,
            Item: item,
        })
        .promise();
};

const isDataValid = (data) => {
    if (!data) return false;
    if (!data.title || typeof data.title !== 'string') return false;
    if (typeof data.description !== 'string') return false;
    if (typeof data.price !== 'number') return false;
    if (typeof data.count !== 'number') return false;

    return true;
};

const createProduct = async (event) => {
    const data = JSON.parse(event.body);

    if (!isDataValid(data)) {
        return {
            statusCode: 400,
            headers: DEFAULT_HEADERS,
            body: 'Product data is invalid.',
        };
    }

    const id = AWS.util.uuid.v4();

    const product = {
        id: id,
        price: data.price,
        title: data.title,
        description: data.description,
    };

    const stock = {
        product_id: id,
        count: data.count,
    };

    await Promise.all([putProduct(product), putStock(stock)]);

    return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ ...product, count: stock.count }),
    };
};

module.exports = async (event) => {
    try {
        console.log('createProduct: ', JSON.stringify(event));
        return await createProduct(event);
    } catch {
        return {
            statusCode: 500,
            headers: DEFAULT_HEADERS,
            body: 'Something goes wrong.',
        };
    }
};
