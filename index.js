const { loadConfig } = require('./src/config');
const { fetchData } = require('./src/api');
const { logger, prepareDirectories, writeCsv } = require('./src/io');

async function main() {
    try {
        logger.info('Starting e-Stat Data Fetcher...');

        // 1. Load Config
        // Get config file path from command line args (e.g. node index.js my-config.json)
        const configFilePath = process.argv[2];
        if (configFilePath) {
            logger.info(`Using config file: ${configFilePath}`);
        }

        const config = await loadConfig(configFilePath);

        logger.info(`Target City Code: ${config.cityCode}`);
        logger.info(`Number of Targets: ${config.targets.length}`);

        // 2. Prepare Output
        await prepareDirectories();

        // 3. Fetch Data
        const allData = [];
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (const [index, target] of config.targets.entries()) {
            const label = target.description ? `${target.description} (${target.statsDataId})` : target.statsDataId;
            logger.info(`Fetching data for: ${label}...`);

            try {
                const data = await fetchData(config.appId, config.cityCode, target);
                if (data) {
                    allData.push(...data);
                }
            } catch (err) {
                logger.error(`Failed to fetch data for ${target.statsDataId}: ${err.message}`);
            }

            // Wait 1 second between requests, but not after the last one
            if (index < config.targets.length - 1) {
                await sleep(1000);
            }
        }

        // 4. Write to CSV
        if (allData.length > 0) {
            logger.info(`Writing ${allData.length} records...`);
            const filePath = await writeCsv(allData);
            logger.info(`Saved to ${filePath}`);
            logger.info('Done!');
        } else {
            logger.warn('No data fetched.');
        }

    } catch (error) {
        logger.error(`Fatal Error: ${error.message}`);
        process.exit(1);
    }
}

main();
