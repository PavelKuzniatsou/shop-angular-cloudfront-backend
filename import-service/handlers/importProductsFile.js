'use strict';
const DEFAULT_HEADERS = {
    'Access-Control-Allow-Origin': '*',
};

const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-1' });
const BUCKET = process.env.BUCKET_NAME;

const importProductsFile = async (event) => {
    if (
        !event ||
        !event.queryStringParameters ||
        !event.queryStringParameters.name
    ) {
        return {
            statusCode: 400,
            headers: DEFAULT_HEADERS,
            body: 'Please provide file name',
        };
    }

    const fileName = event.queryStringParameters.name;

    const params = {
        Bucket: BUCKET,
        Key: `uploaded/${fileName}`,
        Expires: 60,
        ContentType: 'text/csv',
    };

    var signedUrl = s3.getSignedUrl('putObject', params);

    return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(signedUrl),
    };
};

module.exports = async (event) => {
    try {
        return await importProductsFile(event);
    } catch {
        return {
            statusCode: 500,
            headers: DEFAULT_HEADERS,
            body: 'Something goes wrong.',
        };
    }
};
