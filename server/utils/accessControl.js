const toPlainObject = (doc) =>
        doc && typeof doc.toObject === "function"
                ? doc.toObject({ getters: true, virtuals: false })
                : doc;

const normalizeRoles = (roles) => (Array.isArray(roles) ? roles : []);

const deriveAppPermissions = (appDoc, userEmail) => {
        const app = toPlainObject(appDoc);
        const roles = normalizeRoles(app?.roles);
        const isCreator = app?.creator === userEmail;
        const isDeveloper = roles.some(
                (role) =>
                        typeof role?.name === "string" &&
                        role.name.toLowerCase() === "developer" &&
                        Array.isArray(role.members) &&
                        role.members.includes(userEmail)
        );
        const isMember = roles.some(
                (role) => Array.isArray(role?.members) && role.members.includes(userEmail)
        );
        const canManage = isCreator || isDeveloper;
        const canView = canManage || (app?.published === true && isMember);

        return {
                isCreator,
                isDeveloper,
                isMember,
                canManage,
                canView,
        };
};

const filterRolesForUser = (roles, userEmail, canManage) => {
        const normalized = normalizeRoles(roles);

        if (canManage) {
                return normalized;
        }

        return normalized.map((role) => ({
                name: role?.name,
                members:
                        Array.isArray(role?.members) && role.members.includes(userEmail)
                                ? [userEmail]
                                : [],
        }));
};

const sanitizeApp = (appDoc, userEmail) => {
        const app = toPlainObject(appDoc);

        if (!app) {
                return null;
        }

        const permissions = deriveAppPermissions(app, userEmail);

        if (!permissions.canView) {
                return null;
        }

        const sanitized = {
                _id: app._id,
                name: app.name,
                dataSources: app.dataSources,
                view: app.view,
                roles: filterRolesForUser(app.roles, userEmail, permissions.canManage),
                published: app.published,
                permissions,
        };

        if (permissions.canManage) {
                sanitized.roleSheet = app.roleSheet;
        }

        return sanitized;
};

const sanitizeDataSource = (dataSourceDoc, { includeSpreadsheetId } = {}) => {
        const dataSource = toPlainObject(dataSourceDoc);

        if (!dataSource) {
                return null;
        }

        const sanitized = {
                _id: dataSource._id,
                name: dataSource.name,
                url: dataSource.url,
                gid: dataSource.gid,
                key: dataSource.key,
                columns: dataSource.columns,
                published: dataSource.published,
        };

        if (includeSpreadsheetId) {
                sanitized.spreadsheetId = dataSource.spreadsheetId;
        }

        return sanitized;
};

const sanitizeView = (viewDoc) => {
        const view = toPlainObject(viewDoc);

        if (!view) {
                return null;
        }

        return {
                _id: view._id,
                name: view.name,
                table: view.table,
                columns: view.columns,
                type: view.type,
                allowedActions: view.allowedActions,
                roles: view.roles,
                filter: view.filter,
                userFilter: view.userFilter,
                editFilter: view.editFilter,
                editableCols: view.editableCols,
        };
};

const getUserRoleNames = (appDoc, userEmail) => {
        const app = toPlainObject(appDoc);
        const roles = normalizeRoles(app?.roles);

        return roles
                .filter((role) => Array.isArray(role?.members) && role.members.includes(userEmail))
                .map((role) => role.name);
};

module.exports = {
        deriveAppPermissions,
        filterRolesForUser,
        sanitizeApp,
        sanitizeDataSource,
        sanitizeView,
        getUserRoleNames,
};
