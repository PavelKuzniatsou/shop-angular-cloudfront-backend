'use strict';
const DEFAULT_HEADERS = {
    'Access-Control-Allow-Origin': '*',
};

const AWS = require('aws-sdk');
const csv = require('csv-parser');
const s3 = new AWS.S3({ region: 'eu-west-1' });
const sqs = new AWS.SQS();
const BUCKET = process.env.BUCKET_NAME;
const SQS_URL = process.env.SQS_URL;

const parseData = (s3Stream) => {
    return new Promise((resolve, reject) => {
        s3Stream
            .on('data', (product) =>
                sqs.sendMessage(
                    {
                        QueueUrl: SQS_URL,
                        MessageBody: JSON.stringify(product),
                    },
                    (error) => {
                        console.log('Error: ', error);
                        console.log('Send SQS message: ', product);
                    }
                )
            )
            .on('error', () => reject())
            .on('end', () => resolve());
    });
};

const importFileParser = async (event) => {
    for (let record of event.Records) {
        const params = {
            Bucket: BUCKET,
            Key: record.s3.object.key,
        };
        const s3Stream = s3.getObject(params).createReadStream().pipe(csv());

        await parseData(s3Stream);

        await s3
            .copyObject({
                Bucket: BUCKET,
                CopySource: BUCKET + '/' + record.s3.object.key,
                Key: record.s3.object.key.replace('uploaded', 'parsed'),
            })
            .promise();

        await s3
            .deleteObject({
                Bucket: BUCKET,
                Key: record.s3.object.key,
            })
            .promise();
    }

    return {
        statusCode: 202,
    };
};

module.exports = async (event) => {
    try {
        return await importFileParser(event);
    } catch {
        return {
            statusCode: 500,
            headers: DEFAULT_HEADERS,
            body: 'Something goes wrong.',
        };
    }
};
