'use strict';

const PRODUCTS_LIST = require('./products.json');
const DEFAULT_RESPONSE = {
    statusCode: 500,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
    body: 'Product not found',
};

module.exports = async (event) => {
    if (!event || !event.pathParameters) {
        return {
            ...DEFAULT_RESPONSE,
            body: 'Please provide ID',
        };
    }

    const id = event.pathParameters.id;

    const product = PRODUCTS_LIST.find((item) => item.id === id);

    return product
        ? {
              ...DEFAULT_RESPONSE,
              statusCode: 200,
              body: JSON.stringify({ product }),
          }
        : {
              ...DEFAULT_RESPONSE,
          };

    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
