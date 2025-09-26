/**
 *
 * Back-end API that handles the spreadsheet requests.
 *
 */

const { verifyToken } = require("./authController");
const {
	getSheetByURL,
	getGlobalDevList,
	editSheetByURL,
} = require("../misc/sheetsHelper");
const { getDataSource, checkSchemaConsistency } = require("../misc/dataHelper");

const dotenv = require("dotenv");
dotenv.config();

/**
 * performs error checking of the whole process.
 * if no errors found, returns the sheet and gid.
 * @param req
 * @param res
 */
getSheetInfo = async (user, sheetURL) => {
	try {
		if (!sheetURL) {
			return res.status(400).json({
				success: false,
				errorMessage: "No spreadsheet provided",
			});
		}

		if (!user) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		let { sheetInfo, sheetId, GID } = await getSheetByURL(sheetURL, user);

		const ds = await getDataSource(sheetId);

		if (ds) {
			let check = await checkSchemaConsistency(ds, sheetInfo);

			if (!check)
				return res.status(400).json({
					success: false,
					errorMessage: "Columns different from expected",
				});
		}

		if (!sheetInfo) {
			return res.status(400).json({
				success: false,
				errorMessage: "Empty spreadsheet",
			});
		}

		return {
			success: true,
			sheet: sheetInfo,
			sheetId: sheetId,
			gid: GID,
		};
	} catch (err) {
		console.error(err);
		let errorMessage = "";
		if (!err.errors) {
			return {
				success: false,
				errorMessage: "Unknown error, please make sure you entered a valid URL",
			};
		}
		for (let error of err.errors) {
			errorMessage += error.message;
		}
		return {
			success: false,
			errorMessage:
				"Google's API returned the following error(s):\n" + errorMessage,
		};
	}
};
getSheetInfo2 = async (req, res) => {
	try {
		const user = req.query.user;
		const sheetURL = req.query.sheetURL;

		if (!sheetURL) {
			return res.status(400).json({
				success: false,
				errorMessage: "No spreadsheet provided",
			});
		}

		if (!user) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		let { sheetInfo, sheetId, GID } = await getSheetByURL(sheetURL, user.email);

		const ds = await getDataSource(sheetId);

		if (ds) {
			let check = await checkSchemaConsistency(ds, sheetInfo);

			console.log(check);

			if (!check)
				return res.status(400).json({
					success: false,
					errorMessage: "Columns different from expected",
				});
		}

		if (!sheetInfo) {
			return res.status(400).json({
				success: false,
				errorMessage: "Empty spreadsheet",
			});
		}

		return res.status(200).json({
			success: true,
			sheet: sheetInfo,
			sheetId: sheetId,
			gid: GID,
		});
	} catch (err) {
		console.error(err);
		let errorMessage = "";
		if (!err.errors) {
			return res.status(200).json({
				success: false,
				errorMessage: "Unknown error, please make sure you entered a valid URL",
			});
		}
		for (let error of err.errors) {
			errorMessage += error.message;
		}
		return res.status(400).json({
			success: false,
			errorMessage:
				"Google's API returned the following error(s):\n" + errorMessage,
		});
	}
};

/**
 * performs error checking of the whole process.
 * if no errors found, returns the sheet and gid.
 * @param req
 * @param res
 */
editSheetReq = async (req, res) => {
	try {
		const user = req.body.user;
		const sheetURL = req.body.sheetURL; // "https://docs.google.com/spreadsheets/d/1Kh2d32RzhzwqjxcBq5Ry3Hq17VaC844ln-yQNYVisWA/edit#gid=0";
		const values = req.body.values; // Should be a 2d array [["12", "TRUE", "11:00 AM", "6:00 PM", "Comment 4", "FALSE", "gmail.com"]];
		const row = req.body.row;

		if (!sheetURL || !values || !row || !user) {
			return res.status(400).json({
				success: false,
				errorMessage: "Please enter all required fields.",
			});
		}

		if (values === "DELETE") values = [];

		let { editInfo } = await editSheetByURL(sheetURL, row, values);

		if (!editInfo.success) {
			return res.status(400).json({
				success: false,
				errorMessage: editInfo.message,
			});
		}

		return res.status(200).json(editInfo);
	} catch (err) {
		console.error(err);
	}
};

/**
 * Checks if the email is in the global developers list
 * @param {string} email
 */
inGlobalDevList = async (req, res) => {
	// decode token from auth api
	const token = req.query.user;
	let globalDevList = await getGlobalDevList();
	const data = await verifyToken(token);
	let creatorEmail = data.email;

	// Check if creatorEmail is in the contents of the dev list
	if (globalDevList.indexOf(creatorEmail) > -1) {
		return res.status(200).json({
			success: true,
			message: "Email is in global developer list",
		});
	} else {
		return res.status(200).json({
			success: false,
			message: "Email is NOT in global developer list",
		});
	}
};

module.exports = {
	getSheetInfo,
	inGlobalDevList,
	editSheetReq,
};
