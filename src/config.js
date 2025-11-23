const fs = require('fs-extra');
const path = require('path');

async function loadConfig(configFilePath) {
    const secretPath = path.join(process.cwd(), 'secret.json');
    // Use provided path or default
    const configPath = configFilePath
        ? path.resolve(process.cwd(), configFilePath)
        : path.join(process.cwd(), 'configs', 'estat-config.json');

    if (!await fs.pathExists(secretPath)) {
        throw new Error('secret.json not found. Please create one with your appId.');
    }
    if (!await fs.pathExists(configPath)) {
        throw new Error(`Config file not found: ${configPath}`);
    }

    const secret = await fs.readJson(secretPath);
    const config = await fs.readJson(configPath);

    if (!secret.appId || secret.appId === 'YOUR_API_KEY_HERE') {
        throw new Error('Invalid App ID in secret.json.');
    }
    if (!config.cityCode || typeof config.cityCode !== 'string') {
        throw new Error('City code not specified or invalid in estat-config.json.');
    }
    if (!config.targets || !Array.isArray(config.targets) || config.targets.length === 0) {
        throw new Error('No targets specified in estat-config.json.');
    }

    return {
        appId: secret.appId,
        cityCode: config.cityCode,
        targets: config.targets
    };
}

module.exports = { loadConfig };
