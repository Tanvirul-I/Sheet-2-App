const DataSource = require("../schemas/dataSource-schema");
const App = require("../schemas/app-schema");

const { getSheetByURL } = require("../misc/sheetsHelper");
const {
  sanitizeDataSource,
  deriveAppPermissions,
} = require("../utils/accessControl");

const ensureUserEmail = (req, res) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    res.status(401).json({
      success: false,
      error: "User is not authenticated.",
    });

    return null;
  }

  return userEmail;
};

const getAppPermissionsForDataSource = async (dataSourceId, userEmail) => {
  const app = await App.findOne({ dataSources: dataSourceId });

  if (!app) {
    return { app: null, permissions: null };
  }

  return { app, permissions: deriveAppPermissions(app, userEmail) };
};

createDataSource = async (req, res) => {
  try {
    const body = req.body || {};
    const userEmail = ensureUserEmail(req, res);

    console.log("createDataSource body: " + JSON.stringify(body));

    if (!body) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    if (!userEmail) {
      return;
    }

    const payload = {
      name: body.name,
      url: body.url,
      spreadsheetId: body.spreadsheetId,
      gid: body.gid,
      key: body.key,
      columns: body.columns,
      published: body.published === true,
      creator: userEmail,
    };

    const ds = new DataSource(payload);

    await ds.save();

    return res.status(201).json({
      success: true,
      ds: sanitizeDataSource(ds, { includeSpreadsheetId: true }),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

updateDataSource = async (req, res) => {
  try {
    const body = req.body;
    const userEmail = ensureUserEmail(req, res);

    console.log("updateDataSource body: " + JSON.stringify(body));

    if (!body) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    if (!userEmail) {
      return;
    }

    const ds = await DataSource.findOne({ _id: body._id });

    if (!ds) {
      return res.status(404).json({ success: false });
    }

    const ownsDataSource = ds.creator === userEmail;
    let includeSpreadsheetId = ownsDataSource;

    if (!ownsDataSource) {
      const { app, permissions } = await getAppPermissionsForDataSource(
        ds._id,
        userEmail,
      );

      if (!app || !permissions?.canManage) {
        return res.status(403).json({
          success: false,
          error: "User is not authorized to modify this data source.",
        });
      }

      includeSpreadsheetId = permissions.canManage;
    }

    if (body.name !== undefined) ds.name = body.name;
    if (body.published !== undefined) ds.published = body.published === true;
    if (body.url !== undefined) ds.url = body.url;
    if (body.gid !== undefined) ds.gid = body.gid;
    if (body.key !== undefined) ds.key = body.key;
    if (body.columns !== undefined) ds.columns = body.columns;

    await ds.save();

    return res.status(200).json({
      success: true,
      ds: sanitizeDataSource(ds, { includeSpreadsheetId }),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

getDataSourceById = async (req, res) => {
  try {
    const id = req.query.id;
    const userEmail = ensureUserEmail(req, res);

    if (!id) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    if (!userEmail) {
      return;
    }

    const ds = await DataSource.findOne({ _id: id });

    if (!ds) {
      return res.status(404).json({ error: "no ds with this id" });
    }

    let includeSpreadsheetId = false;
    let canView = false;

    if (ds.creator === userEmail) {
      canView = true;
      includeSpreadsheetId = true;
    } else {
      const { app, permissions } = await getAppPermissionsForDataSource(
        ds._id,
        userEmail,
      );

      if (!app) {
        return res.status(403).json({
          success: false,
          error: "User is not authorized to access this data source.",
        });
      }

      if (!permissions?.canView) {
        return res.status(403).json({
          success: false,
          error: "User is not authorized to access this data source.",
        });
      }

      canView = true;
      includeSpreadsheetId = permissions.canManage;
    }

    if (!canView) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to access this data source.",
      });
    }

    const sanitizedDs = sanitizeDataSource(ds, { includeSpreadsheetId });

    const { sheetInfo } = await getSheetByURL(ds.url, userEmail);

    return res.status(200).json({
      success: true,
      ds: sanitizedDs,
      data: sheetInfo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

deleteDataSource = async (req, res) => {
  try {
    const id = req.query.id;
    const userEmail = ensureUserEmail(req, res);

    if (!id) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    if (!userEmail) {
      return;
    }

    const ds = await DataSource.findOne({ _id: id });

    if (!ds) {
      return res.status(404).json({ error: "no ds with this id" });
    }

    if (ds.creator !== userEmail) {
      const { app, permissions } = await getAppPermissionsForDataSource(
        ds._id,
        userEmail,
      );

      if (!app || !permissions?.canManage) {
        return res.status(403).json({
          success: false,
          error: "User is not authorized to delete this data source.",
        });
      }
    }

    await DataSource.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

module.exports = {
  createDataSource,
  updateDataSource,
  getDataSourceById,
  deleteDataSource,
};
