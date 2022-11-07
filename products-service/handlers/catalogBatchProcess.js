const AWS = require('aws-sdk');
const { DEFAULT_HEADERS } = require('./common');
const { createProduct } = require('./dataBase');

const getProduct = (data) => {
    const product = JSON.parse(data);
    return {
        ...product,
        price: Number(product.price),
        count: Number(product.count),
    };
};

const catalogBatchProcess = async (event) => {
    const products = event.Records.map(({ body }) => getProduct(body));
    const results = await Promise.allSettled(
        products.map((product) => createProduct(product))
    );

    const sns = new AWS.SNS({ region: 'eu-west-1' });
    await sns
        .publish({
            Subject: 'Products were added.',
            Message: JSON.stringify(products),
            TopicArn: process.env.SNS_ARN,
        })
        .promise();

    return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
    };
};

module.exports = async (event) => {
    try {
        console.log('catalogBatchProcess: ', JSON.stringify(event));
        return await catalogBatchProcess(event);
    } catch {
        return {
            statusCode: 500,
            headers: DEFAULT_HEADERS,
            body: 'Something goes wrong.',
        };
    }
};
