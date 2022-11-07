const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const { DEFAULT_HEADERS, isDataValid } = require('./common');
const ProductsTableName = process.env.PRODUCTS_TABLE;
const StocksTableName = process.env.STOCKS_TABLE;

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

module.exports = {
    createProduct: async (data) => {
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

        return Promise.all([putProduct(product), putStock(stock)]).then(() => {
            return {
                ...data,
                id,
            };
        });
    },
};
