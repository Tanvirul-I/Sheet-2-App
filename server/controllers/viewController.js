const View = require("../schemas/view-schema");
const App = require("../schemas/app-schema");

const { sanitizeView, deriveAppPermissions, getUserRoleNames } = require("../utils/accessControl");

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

const getAppForView = async (viewId) => App.findOne({ view: viewId });

createView = async (req, res) => {
    try {
        const body = req.body || {};
        const userEmail = ensureUserEmail(req, res);

        console.log("createView body: " + JSON.stringify(body));

        if (!body) {
            return res.status(400).json({ errorMessage: "Please enter all required fields." });
        }

        if (!userEmail) {
            return;
        }

        const payload = {
            name: body.name,
            table: body.table,
            columns: body.columns,
            type: body.type,
            allowedActions: body.allowedActions,
            roles: body.roles,
            filter: body.filter,
            userFilter: body.userFilter,
            editFilter: body.editFilter,
            editableCols: body.editableCols,
            creator: userEmail,
        };

        const view = new View(payload);

        await view.save();

        return res.status(201).json({
            success: true,
            view: sanitizeView(view),
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err,
        });
    }
};

updateView = async (req, res) => {
    try {
        const body = req.body;
        const userEmail = ensureUserEmail(req, res);

        console.log("updateView body: " + JSON.stringify(body));

        if (!body) {
            return res.status(400).json({ errorMessage: "Please enter all required fields." });
        }

        if (!userEmail) {
            return;
        }

        const view = await View.findOne({ _id: body._id });

        if (!view) {
            return res.status(404).json({ success: false });
        }

        let canManage = view.creator === userEmail;

        if (!canManage) {
            const app = await getAppForView(view._id);

            if (!app) {
                return res.status(403).json({
                    success: false,
                    error: "User is not authorized to modify this view.",
                });
            }

            const permissions = deriveAppPermissions(app, userEmail);

            if (!permissions?.canManage) {
                return res.status(403).json({
                    success: false,
                    error: "User is not authorized to modify this view.",
                });
            }

            canManage = true;
        }

        if (body.name !== undefined) view.name = body.name;
        if (body.table !== undefined) view.table = body.table;
        if (body.columns !== undefined) view.columns = body.columns;
        if (body.type !== undefined) view.type = body.type;
        if (body.allowedActions !== undefined) view.allowedActions = body.allowedActions;
        if (body.roles !== undefined) view.roles = body.roles;
        if (body.filter !== undefined) view.filter = body.filter;
        if (body.userFilter !== undefined) view.userFilter = body.userFilter;
        if (body.editFilter !== undefined) view.editFilter = body.editFilter;
        if (body.editableCols !== undefined) view.editableCols = body.editableCols;

        await view.save();

        return res.status(200).json({
            success: true,
            view: sanitizeView(view),
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
        });
    }
};

getViewById = async (req, res) => {
    try {
        const id = req.query.id;
        const userEmail = ensureUserEmail(req, res);

        if (!id) {
            return res.status(400).json({ errorMessage: "Please enter all required fields." });
        }

        if (!userEmail) {
            return;
        }

        console.log("getting view with id " + id);

        const view = await View.findOne({ _id: id });

        if (!view) {
            return res.status(404).json({ error: "no view with this id" });
        }

        if (view.creator === userEmail) {
            return res.status(200).json({
                success: true,
                view: sanitizeView(view),
            });
        }

        const app = await getAppForView(view._id);

        if (!app) {
            return res.status(403).json({
                success: false,
                error: "User is not authorized to access this view.",
            });
        }

        const permissions = deriveAppPermissions(app, userEmail);

        if (permissions?.canManage) {
            return res.status(200).json({
                success: true,
                view: sanitizeView(view),
            });
        }

        const userRoles = getUserRoleNames(app, userEmail);
        const hasViewRole = Array.isArray(view.roles)
            ? view.roles.some((roleName) => userRoles.includes(roleName))
            : false;

        if (!permissions?.canView || !hasViewRole) {
            return res.status(403).json({
                success: false,
                error: "User is not authorized to access this view.",
            });
        }

        return res.status(200).json({
            success: true,
            view: sanitizeView(view),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
};

deleteView = async (req, res) => {
    try {
        const id = req.query.id;
        const userEmail = ensureUserEmail(req, res);

        if (!id) {
            return res.status(400).json({ errorMessage: "Please enter all required fields." });
        }

        if (!userEmail) {
            return;
        }

        console.log("deleting view with id " + id);

        const view = await View.findOne({ _id: id });

        if (!view) {
            return res.status(404).json({ error: "no view with this id" });
        }

        if (view.creator !== userEmail) {
            const app = await getAppForView(view._id);

            if (!app) {
                return res.status(403).json({
                    success: false,
                    error: "User is not authorized to delete this view.",
                });
            }

            const permissions = deriveAppPermissions(app, userEmail);

            if (!permissions?.canManage) {
                return res.status(403).json({
                    success: false,
                    error: "User is not authorized to delete this view.",
                });
            }
        }

        await View.deleteOne({ _id: id });

        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
};

module.exports = {
    createView,
    updateView,
    getViewById,
    deleteView,
};
