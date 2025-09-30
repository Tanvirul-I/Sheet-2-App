const DataSource = require("../schemas/dataSource-schema");
const App = require("../schemas/app-schema");
const { deriveAppPermissions } = require("../utils/accessControl");

/**
 * Resolves data source access for a user given a spreadsheet id.
 * @param { string } spreadsheetId
 * @param { string } userEmail
 * @returns {Promise<{dataSource: *, app: *, permissions: *, canView: boolean, canManage: boolean}>}
 */
getDataSourceAccess = async (spreadsheetId, userEmail) => {
  if (!spreadsheetId) {
    return {
      dataSource: null,
      app: null,
      permissions: null,
      canView: false,
      canManage: false,
    };
  }

  const dataSource = await DataSource.findOne({ spreadsheetId });

  if (!dataSource) {
    return {
      dataSource: null,
      app: null,
      permissions: null,
      canView: false,
      canManage: false,
    };
  }

  if (dataSource.creator === userEmail) {
    return {
      dataSource,
      app: null,
      permissions: null,
      canView: true,
      canManage: true,
    };
  }

  const app = await App.findOne({ dataSources: dataSource._id });

  if (!app) {
    return {
      dataSource,
      app: null,
      permissions: null,
      canView: false,
      canManage: false,
    };
  }

  const permissions = deriveAppPermissions(app, userEmail);
  const canView = permissions?.canView === true;
  const canManage = permissions?.canManage === true;

  return {
    dataSource,
    app,
    permissions,
    canView,
    canManage,
  };
};

/**
 * checks schema based on spreadsheetId.
 * @param { object } datasource
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
  getDataSourceAccess,
  checkSchemaConsistency,
};
