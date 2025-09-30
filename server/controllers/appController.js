const { getSheetByURL } = require("../misc/sheetsHelper");
const App = require("../schemas/app-schema");
const { sanitizeApp, deriveAppPermissions } = require("../utils/accessControl");

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

getApps = async (req, res) => {
  try {
    const userEmail = ensureUserEmail(req, res);

    if (!userEmail) {
      return;
    }

    console.log(`Retrieving apps for ${userEmail}`);

    const apps = await App.find({
      $or: [{ creator: userEmail }, { "roles.members": userEmail }],
    });

    const sanitizedApps = apps
      .map((app) => sanitizeApp(app, userEmail))
      .filter((app) => app !== null);

    return res.status(200).json({
      success: true,
      apps: sanitizedApps,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

createApp = async (req, res) => {
  try {
    const body = req.body || {};
    const userEmail = ensureUserEmail(req, res);

    if (!userEmail) {
      return;
    }

    console.log("createApp body: " + JSON.stringify(body));

    if (!body) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    const payload = {
      name: body.name,
      roleSheet: body.roleSheet,
      roles: body.roles,
      published: body.published === true,
      dataSources: Array.isArray(body.dataSources) ? body.dataSources : [],
      view: Array.isArray(body.view) ? body.view : [],
      creator: userEmail,
    };

    const app = new App(payload);

    await app.save();

    return res.status(201).json({
      success: true,
      app: sanitizeApp(app, userEmail),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

updateApp = async (req, res) => {
  try {
    const body = req.body;
    const userEmail = ensureUserEmail(req, res);

    console.log("updateApp body: " + JSON.stringify(body));

    if (!body) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    if (!userEmail) {
      return;
    }

    const app = await App.findOne({ _id: body._id });

    if (!app) {
      return res.status(404).json({ success: false });
    }

    const permissions = deriveAppPermissions(app, userEmail);

    if (!permissions.canManage) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to modify this app.",
      });
    }

    if (body.name !== undefined) app.name = body.name;
    if (body.published !== undefined) app.published = body.published === true;
    if (body.roleSheet !== undefined) app.roleSheet = body.roleSheet;
    if (body.roles !== undefined) app.roles = body.roles;
    if (body.dataSources !== undefined) app.dataSources = body.dataSources;
    if (body.view !== undefined) app.view = body.view;

    await app.save();

    return res.status(200).json({
      success: true,
      app: sanitizeApp(app, userEmail),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

getAppById = async (req, res) => {
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

    console.log("getting app with id " + id);

    const app = await App.findOne({ _id: id });

    if (!app) {
      return res.status(404).json({ success: false });
    }

    const sanitizedApp = sanitizeApp(app, userEmail);

    if (!sanitizedApp) {
      return res.status(403).json({
        success: false,
        error: "User does not have permission to view this app.",
      });
    }

    return res.status(200).json({
      success: true,
      app: sanitizedApp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

deleteApp = async (req, res) => {
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

    console.log("deleting app with id " + id);

    const app = await App.findOne({ _id: id });

    if (!app) {
      return res.status(404).json({ error: "no app with this id" });
    }

    const permissions = deriveAppPermissions(app, userEmail);

    if (!permissions.isCreator) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to delete this app.",
      });
    }

    await App.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

updateRoles = async (req, res) => {
  try {
    const body = req.body;
    const userEmail = ensureUserEmail(req, res);

    console.log("updateApp body: " + JSON.stringify(body));

    if (!body) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    if (!userEmail) {
      return;
    }

    const app = await App.findOne({ _id: body._id });

    if (!app) {
      return res.status(404).json({ success: false });
    }

    const permissions = deriveAppPermissions(app, userEmail);

    if (!permissions.canManage) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to modify this app.",
      });
    }

    const { sheetInfo } = await getSheetByURL(app.roleSheet, app.creator);

    const newRoles = sheetInfo.map((column) => ({
      name: column[0],
      members: column.slice(1),
    }));

    app.roles = newRoles;

    await app.save();

    return res.status(200).json({
      success: true,
      app: sanitizeApp(app, userEmail),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

module.exports = {
  getApps,
  createApp,
  updateApp,
  getAppById,
  deleteApp,
  updateRoles,
};
