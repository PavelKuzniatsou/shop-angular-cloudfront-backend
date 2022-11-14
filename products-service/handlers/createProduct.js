'use strict';
const { DEFAULT_HEADERS } = require('./common');
const { createProduct: createProductDB } = require('./dataBase');

const createProduct = async (event) => {
    const product = await createProductDB(event.body);

    return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(product),
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
