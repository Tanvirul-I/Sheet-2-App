/**
 *
 * This file contains all the functionality for spreadsheet interactions via Google API.
 * All of these functions expect the OAuth client to be passed into their respective functions.
 *
 */
const { google } = require("googleapis");
const { cache } = require("../classes/cache");
const { OAuthObjectStore } = require("../classes/googleOAuthHandler");

/*let shareSpreadsheet = async (oauth2Client, spreadsheetId) => {
	const { google } = require("googleapis");

	const service = google.drive({ version: "v3", auth: oauth2Client });

	const permission = {
		type: "user",
		role: "writer",
		emailAddress: process.env.SERVICE_ACCOUNT,
	};

	try {
		const result = await service.permissions.create({
			resource: permission,
			fileId: spreadsheetId,
			fields: "id",
		});

		console.log(result);
	} catch (err) {
		throw err;
	}
};*/

let sheetLastModified = async (spreadsheetId) => {
	const { google } = require("googleapis");
	const oauth2Client = OAuthObjectStore.getMain(); // gets the main OAuth Client Object

	const service = google.drive({ version: "v3", auth: oauth2Client });

	try {
		const result = await service.files.get({
			fileId: spreadsheetId,
			fields: "modifiedTime, lastModifyingUser",
		});

		return result.data;
	} catch (err) {
		throw err;
	}
};

/**
 * Gets spreadsheet info. Returns data including spreadsheet URL, sheets within the spreadsheet, locale and timezone.
 * @param {obj} oauth2Client The user's oauth client.
 * @param {string} spreadsheetId The id of the spreadsheet you want to be returned.
 * @return {obj}
 */
let readSpreadSheet = async (spreadsheetId, GID, force) => {
	const oauth2Client = OAuthObjectStore.getMain(); // gets the main OAuth Client Object
	let check = await checkCache("spreadsheet", spreadsheetId, GID);

	if (check.success && !force) {
		console.log("Found SPREADSHEET in Cache");
		console.log(check);
		return check;
	}

	let range;

	const service = google.sheets({ version: "v4", auth: oauth2Client });
	try {
		console.log("No SPREADSHEET in Cache");
		const res = await service.spreadsheets.get({
			spreadsheetId,
		});

		cache.addSpreadSheet(spreadsheetId, check.modifiedData);

		// iterates over the sheets in spreadsheet
		for (let sheet of res.data.sheets) {
			// checks if the gid in URL is the same as sheetIndex
			if (sheet.properties.sheetId == GID) {
				range = sheet.properties.title; // gets the proper range for the specified GID, the title simply returns the whole sheet
			}
		}

		return range;
	} catch (err) {
		throw err;
	}
};

/**
 * Gets spreadsheet data.
 * @param {obj} oauth2Client The user's oauth client.
 * @param {string} spreadsheetId The id of the spreadsheet you want to be returned.
 * @return {obj}
 */
let readSheet = async (
	spreadsheetId,
	range,
	GID,
	majorDimension = "COLUMNS"
) => {
	const oauth2Client = OAuthObjectStore.getMain(); // gets the main OAuth Client Object
	const service = google.sheets({ version: "v4", auth: oauth2Client });
	let check = await checkCache("sheet", spreadsheetId, GID);

	if (check.success) {
		console.log("Found SHEET in Cache");
		return check.data;
	}

	try {
		console.log("No SHEET in Cache");
		const result = await service.spreadsheets.values.get({
			spreadsheetId,
			range: range,
			majorDimension: majorDimension,
		});

		cache.addSheet(spreadsheetId, GID, result.data, check.modifiedData, range);

		return result.data;
	} catch (err) {
		throw err;
	}
};

/**
 * Gets spreadsheet data.
 * @param {obj} oauth2Client The user's oauth client.
 * @param {string} spreadsheetId The id of the spreadsheet you want to be returned.
 * @return {obj}
 */
let editSheet = async (spreadsheetId, range, GID, values, row) => {
	const oauth2Client = OAuthObjectStore.getMain(); // gets the main OAuth Client Object
	let check = await checkCache("sheet", spreadsheetId, GID);

	if (!check.success) {
		console.log("Log during sheet edit, save this output if you see please");
		console.log(check);
		return {
			success: false,
		};
	}
	values = [values];

	const service = google.sheets({ version: "v4", auth: oauth2Client });

	const resource = {
		values,
	};
	try {
		const result = await service.spreadsheets.values.update({
			spreadsheetId,
			range,
			valueInputOption: "USER_ENTERED",
			resource,
		});
		cache.updateSheet(spreadsheetId, GID, row, values);
		//cache.delete(spreadsheetId);
		return { success: true, result: result.data };
	} catch (err) {
		if (err.errors)
			return {
				success: false,
				message: err.errors,
			};
		else {
			console.error(err);
			return {
				success: false,
				message: "Unknown error, please check server logs",
			};
		}
	}
};

let checkCache = async (type, spreadsheetId, GID) => {
	let checkSheet = await sheetLastModified(spreadsheetId);

	let cacheSpreadsheet = cache.getSpreadSheet(spreadsheetId);
	let cacheSheet = cache.getSheet(spreadsheetId, GID);

	console.log("Cache spreadsheet");
	console.log(cacheSpreadsheet);

	if (
		cacheSpreadsheet &&
		cacheSheet &&
		!cache.compare(spreadsheetId, checkSheet)
	) {
		console.log("Spreadsheet has been UPDATED");
		cache.delete(spreadsheetId);
		return { success: false, data: null, modifiedData: checkSheet };
	}

	if (!cacheSpreadsheet)
		return { success: false, data: cacheSheet, modifiedData: checkSheet };
	else if (type == "spreadsheet")
		return { success: true, data: cacheSheet, modifiedData: checkSheet };

	if (!cacheSheet)
		return { success: false, data: cacheSheet, modifiedData: checkSheet };
	else if (type == "sheet")
		return { success: true, data: cacheSheet, modifiedData: checkSheet };

	return { success: false, data: "Invalid Type" };
};

module.exports = {
	sheetLastModified,
	readSheet,
	readSpreadSheet,
	editSheet,
};
