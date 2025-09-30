/**
 *
 * Back-end API that handles the spreadsheet requests.
 *
 */

const {
        getSheetByURL,
        getGlobalDevList,
        editSheetByURL,
        getURLInfo,
} = require("../misc/sheetsHelper");
const { getDataSourceAccess, checkSchemaConsistency } = require("../misc/dataHelper");

const dotenv = require("dotenv");
dotenv.config();

const ensureUserEmail = (req, res) => {
        const userEmail = req.user?.email;

        if (!userEmail) {
                res.status(401).json({
                        success: false,
                        errorMessage: "Please enter all required fields.",
                });

                return null;
        }

        return userEmail;
};

const formatGoogleErrors = (err) => {
        if (!err?.errors) {
                return "Unknown error, please make sure you entered a valid URL";
        }

        let errorMessage = "";

        for (const error of err.errors) {
                errorMessage += error.message;
        }

        return "Google's API returned the following error(s):\n" + errorMessage;
};

const getSheetInfo = async (req, res) => {
        try {
                const sheetURL = req.query.sheetURL;
                const userEmail = ensureUserEmail(req, res);

                if (!sheetURL) {
                        return res.status(400).json({
                                success: false,
                                errorMessage: "No spreadsheet provided",
                        });
                }

                if (!userEmail) {
                        return;
                }

                const { sheetId, GID } = await getURLInfo(sheetURL);
                const access = await getDataSourceAccess(sheetId, userEmail);

                if (!access?.dataSource) {
                        return res.status(404).json({
                                success: false,
                                errorMessage: "Spreadsheet not found.",
                        });
                }

                if (!access.canView) {
                        return res.status(403).json({
                                success: false,
                                errorMessage: "User is not authorized to access this spreadsheet.",
                        });
                }

                const { sheetInfo } = await getSheetByURL(sheetURL, userEmail);

                if (access.dataSource) {
                        const isConsistent = await checkSchemaConsistency(access.dataSource, sheetInfo);

                        if (!isConsistent) {
                                return res.status(400).json({
                                        success: false,
                                        errorMessage: "Columns different from expected",
                                });
                        }
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
                return res.status(400).json({
                        success: false,
                        errorMessage: formatGoogleErrors(err),
                });
        }
};

const editSheetReq = async (req, res) => {
        try {
                const sheetURL = req.body.sheetURL;
                let values = req.body.values;
                const row = req.body.row;
                const userEmail = ensureUserEmail(req, res);

                if (!sheetURL || !values || !row) {
                        return res.status(400).json({
                                success: false,
                                errorMessage: "Please enter all required fields.",
                        });
                }

                if (!userEmail) {
                        return;
                }

                const { sheetId } = await getURLInfo(sheetURL);
                const access = await getDataSourceAccess(sheetId, userEmail);

                if (!access?.dataSource) {
                        return res.status(404).json({
                                success: false,
                                errorMessage: "Spreadsheet not found.",
                        });
                }

                if (!access.canManage) {
                        return res.status(403).json({
                                success: false,
                                errorMessage: "User is not authorized to edit this spreadsheet.",
                        });
                }

                if (values === "DELETE") {
                        values = [];
                }

                const { editInfo } = await editSheetByURL(sheetURL, row, values);

                if (!editInfo.success) {
                        return res.status(400).json({
                                success: false,
                                errorMessage: editInfo.message,
                        });
                }

                return res.status(200).json(editInfo);
        } catch (err) {
                console.error(err);
                return res.status(500).json({
                        success: false,
                        errorMessage: "Unable to edit spreadsheet.",
                });
        }
};

const inGlobalDevList = async (req, res) => {
        try {
                const userEmail = ensureUserEmail(req, res);

                if (!userEmail) {
                        return;
                }

                const globalDevList = await getGlobalDevList();
                const isDeveloper = globalDevList.indexOf(userEmail) > -1;

                return res.status(200).json({
                        success: isDeveloper,
                        message: isDeveloper
                                ? "Email is in global developer list"
                                : "Email is NOT in global developer list",
                });
        } catch (err) {
                console.error(err);
                return res.status(500).json({
                        success: false,
                        errorMessage: "Unable to verify developer status.",
                });
        }
};

module.exports = {
        getSheetInfo,
        inGlobalDevList,
        editSheetReq,
};
