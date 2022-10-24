'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const ProductsTableName = process.env.PRODUCTS_TABLE;
const StocksTableName = process.env.STOCKS_TABLE;

const { DEFAULT_HEADERS } = require('./common');

const getProducts = async () => {
    return await db
        .scan({
            TableName: ProductsTableName,
        })
        .promise();
};

const getStocks = async () => {
    return await db
        .scan({
            TableName: StocksTableName,
        })
        .promise();
};

const mergeResults = (productItems, stockItems) => {
    const productsMap = new Map();

    productItems.forEach((product) => {
        const id = product.id;
        productsMap.set(id, product);
    });

    stockItems.forEach((stock) => {
        const id = stock.product_id;
        const item = productsMap.get(id);
        if (item) {
            item.count = stock.count;
            productsMap.set(id, item);
        }
    });

    return Array.from(productsMap.values());
};

const getProductsList = async (_event) => {
    const [products, stocks] = await Promise.all([getProducts(), getStocks()]);
    const items = mergeResults(products.Items, stocks.Items);

    return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(items),
    };
};

module.exports = async (event) => {
    try {
        console.log('getProductsList: ', JSON.stringify(event));
        return await getProductsList(event);
    } catch {
        return {
            statusCode: 500,
            headers: DEFAULT_HEADERS,
            body: 'Something goes wrong.',
        };
    }
};
