const fs = require('fs-extra');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' }),
    ],
});

async function prepareDirectories() {
    await fs.ensureDir('output');
    await fs.ensureDir('logs');
}

async function writeCsv(data) {
    if (!data || data.length === 0) return;

    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const filePath = path.join('output', `estat_data_${timestamp}.csv`);

    const firstRecord = data[0];
    const allKeys = Object.keys(firstRecord);

    const priorityKeys = ['cityCode', 'area', 'time', 'value', 'unit'];
    const otherKeys = allKeys.filter(k => !priorityKeys.includes(k)).sort();

    const header = [...priorityKeys, ...otherKeys].map(id => ({
        id,
        title: id.toUpperCase()
    }));

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: header
    });

    await csvWriter.writeRecords(data);
    return filePath;
}

module.exports = {
    logger,
    prepareDirectories,
    writeCsv
};
