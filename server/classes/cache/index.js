const cache = {
	sheets: {},
};

/**
 * Returns spreadsheet from objecy.
 * @param { string } sheetID
 * @returns a 2D array containing spreadsheet data
 */

cache.getSpreadSheet = (spreadsheetId) => {
	if (spreadsheetId in cache.sheets) return cache.sheets[spreadsheetId];
	else return undefined;
};

/**
 * Adds spreadsheet to cache with new data, or modifies existing data
 * Modified data is information about the last modified
 *
 * @param { string } sheetID
 * @param { object } data
 * @returns
 */

cache.addSpreadSheet = (spreadsheetId, modifiedData) => {
	modifiedData.modifiedTime = Date.parse(modifiedData.modifiedTime);
	cache.sheets[spreadsheetId] = {
		modifiedData: modifiedData,
	};
};

/**
 * Adds spreadsheet to cache with new data, or modifies existing data
 * @param { string } sheetID
 * @param { string } GID
 * @param { object } data
 * @param { object } data //Sheet data
 * @returns
 */

cache.addSheet = (spreadsheetId, GID, data, modifiedData, range) => {
	cache.sheets[spreadsheetId] = {
		modifiedData: modifiedData,
	};
	cache.sheets[spreadsheetId][GID] = data;
	cache.sheets[spreadsheetId][GID]["range"] = range;
};

/**
 * Updates sheet to cache with new data, or modifies existing data
 * @param { string } sheetID
 * @param { string } GID
 * @param { object } data
 * @param { object } data //Sheet data
 * @returns
 */

cache.updateSheet = (spreadsheetId, GID, row, values) => {
	values = values[0];
	cache.sheets[spreadsheetId]["modifiedData"].modifiedTime = Date.parse(
		new Date()
	);
	for (let idx in cache.sheets[spreadsheetId][GID]["values"]) {
		let column = cache.sheets[spreadsheetId][GID]["values"][idx];
		column.splice(row - 1, 1, values[idx]);
	}
};

/**
 * Get sheet from cache
 * @param { string } sheetID
 * @param { string } GID
 * @returns sheet information
 */

cache.getSheet = (spreadsheetId, GID) => {
	if (spreadsheetId in cache.sheets && GID in cache.sheets[spreadsheetId] > -1)
		return cache.sheets[spreadsheetId][GID];
	else return undefined;
};

/**
 * Compares modified data from old version and current version
 * @param { string } sheetID
 * @param { object } data
 * @returns
 */

cache.compare = (spreadsheetId, modifiedData) => {
	return (
		cache.sheets[spreadsheetId]["modifiedData"].modifiedTime ==
		modifiedData.modifiedTime
	);
};

/**
 * Removes cache object
 * @param { string } sheetID
 * @returns
 */

cache.delete = (spreadsheetId) => {
	delete cache.sheets[spreadsheetId];
};

module.exports = { cache };
