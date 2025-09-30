const { cache } = require("../classes/cache");
const sheetsAPI = require("../google/sheets");

/**
 * gets the sheet using url.
 * @param { string } sheetURL
 * @param { string } email
 * @returns a 2D array containing sheet data
 */
getSheetByURL = async (sheetURL, email) => {
  const { sheetId, GID } = await getURLInfo(sheetURL); // gets the sheetID and GID from helper method

  let range = await sheetsAPI.readSpreadSheet(sheetId, GID); // reads the spreadsheet using the main account

  if (typeof range == "object") {
    console.log(range);
    range = range.data.range;
  }

  let sheetInfoFull = await sheetsAPI.readSheet(sheetId, range, GID); // reads the desired sheet using main credentails
  let sheetInfo = sheetInfoFull.values;

  return { sheetInfo, sheetId, GID, range }; // return 2D array containing cell data.
};

/**
 * Gets the global developer list sheet.
 * @returns a 2D array containing sheet data
 */
getGlobalDevList = async () => {
  const { sheetInfo } = await getSheetByURL(process.env.GLOBAL_DEV_LIST_URL); // gets the sheetID and GID from helper method

  let globalDevList = sheetInfo[0].slice(1);

  return globalDevList; // return 2D array containing cell data.
};

/**
 * performs string manipulation on the URL and returns.
 * Helper method for both of the 2 functions.
 * @param { string } spreadsheetURL
 * @returns JSON object containting the sheetID and the gid
 */
getURLInfo = async (spreadsheetURL) => {
  const startingLocation = spreadsheetURL.indexOf("spreadsheets/d/") + 15;

  const sheetId = spreadsheetURL.slice(
    startingLocation,
    spreadsheetURL.indexOf("/", startingLocation + 1),
  );

  const GID =
    spreadsheetURL.indexOf("gid=") > -1
      ? spreadsheetURL.slice(spreadsheetURL.indexOf("gid=") + 4)
      : 0;

  return { sheetId, GID };
};

/**
 * edits the sheet using url.
 * @param { string } sheetURL
 * @param { string } email
 * @returns a 2D array containing sheet data
 */
editSheetByURL = async (sheetURL, row, values) => {
  const { sheetId, GID } = await getURLInfo(sheetURL); // gets the sheetID and GID from helper method

  let { range } = await getSheetByURL(sheetURL);
  range += `!${row}:${row}`;

  let editInfo = await sheetsAPI.editSheet(sheetId, range, GID, values, row); // reads the desired sheet using main credentails

  //let { sheetInfo } = await getSheetByURL(sheetURL); //updating to cache
  //editInfo["data"] = sheetInfo;

  return { editInfo }; // return 2D array containing cell data.
};

module.exports = {
  getSheetByURL,
  getGlobalDevList,
  editSheetByURL,
  getURLInfo,
};
