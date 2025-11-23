const axios = require('axios');

async function fetchData(appId, cityCode, targetConfig) {
    const url = 'http://api.e-stat.go.jp/rest/3.0/app/json/getStatsData';

    // Default parameters
    const defaultParams = {
        appId: appId,
        cdArea: cityCode,
        lang: 'J',
        metaGetFlg: 'Y',
        cntGetFlg: 'N',
        explanationGetFlg: 'Y',
        annotationGetFlg: 'Y',
        sectionHeaderFlg: '1',
        replaceSpChars: '0'
    };

    // Merge defaults with target config
    const params = { ...defaultParams, ...targetConfig };

    try {
        const response = await axios.get(url, { params });
        const data = response.data;

        if (data.GET_STATS_DATA.RESULT.STATUS !== 0) {
            throw new Error(`API Error: ${data.GET_STATS_DATA.RESULT.ERROR_MSG}`);
        }

        const statisticalData = data.GET_STATS_DATA.STATISTICAL_DATA;
        const values = statisticalData.DATA_INF.VALUE;
        const classObjects = statisticalData.CLASS_INF.CLASS_OBJ;

        // Helper to find class name
        const getClassName = (id, code) => {
            const classObj = classObjects.find(obj => obj['@id'] === id);
            if (!classObj) return code;

            let classes = classObj.CLASS;
            if (!Array.isArray(classes)) {
                classes = [classes];
            }

            const cls = classes.find(c => c['@code'] === code);
            return cls ? cls['@name'] : code;
        };

        if (!values || values.length === 0) return [];

        // Filter for latest time
        const latestRecords = {};
        values.forEach(val => {
            // Create a key for grouping. Exclude @time, $, @unit
            // We want to find the latest time for each unique combination of other categories
            const groupKey = Object.keys(val)
                .filter(k => k !== '@time' && k !== '$' && k !== '@unit')
                .sort()
                .map(k => `${k}:${val[k]}`)
                .join('|');

            // Compare time codes (lexicographically)
            if (!latestRecords[groupKey] || val['@time'] > latestRecords[groupKey]['@time']) {
                latestRecords[groupKey] = val;
            }
        });

        const filteredValues = Object.values(latestRecords);

        // Flatten and format data
        return filteredValues.map(val => {
            const record = {
                cityCode: cityCode,
                value: val['$'],
                unit: val['@unit']
            };

            for (const key in val) {
                if (key.startsWith('@cat')) {
                    const catId = key.substring(1);
                    record[catId] = getClassName(catId, val[key]);
                } else if (key === '@time') {
                    record['time'] = getClassName('time', val[key]);
                } else if (key === '@area') {
                    record['area'] = getClassName('area', val[key]);
                }
            }
            return record;
        });

    } catch (error) {
        if (error.response) {
            throw new Error(`HTTP Error: ${error.response.status} ${error.response.statusText}`);
        }
        throw error;
    }
}

module.exports = { fetchData };
