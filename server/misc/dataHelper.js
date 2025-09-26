const DataSource = require("../schemas/dataSource-schema");
/**
 * gets datasource.
 * @param { string } spreadsheetId
 * @returns
 */
getDataSource = async (spreadsheetId) => {
	return await DataSource.findOne({ spreadsheetId: spreadsheetId });
};

/**
 * checks schema based on spreadsheetId.
 * @param { string } spreadsheetId
 * @param { array } sheetInfo
 * @returns
 */
checkSchemaConsistency = async (datasource, sheetInfo) => {
	let found = false;

	for (let columnSheet of sheetInfo) {
		for (let columnDS of datasource.columns) {
			if (columnSheet[0] == columnDS["name"]) {
				found = true;
			}
		}
		if (!found) return false;
		found = false;
	}

	return true;
};

module.exports = {
	getDataSource,
	checkSchemaConsistency,
};
