import { useState, useContext, useEffect, useMemo } from "react";
import appAPI from "../../api/app";
import sheetsAPI from "../../api/sheets";

import { AuthContext } from "../../context/auth";
import {
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Box,
    Typography,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    Switch,
    CircularProgress,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SyncIcon from "@mui/icons-material/Sync";
import ArchiveIcon from "@mui/icons-material/Archive";
import App from "./AppComponent";

export default function MakeApp(props) {
    // state variables for input fields
    let [name, setName] = useState("");
    let [roleSheet, setRoleSheet] = useState("");
    const [gid, setGid] = useState("");
    const [sheetInfo, setSheetInfo] = useState([]);
    const [error, setError] = useState("");
    // the list of created Apps
    let [appList, setAppList] = useState();
    let [selectedApp, setSelectedApp] = useState();
    let [selectedI, setSelectedI] = useState(0);
    let [activeApp, setActiveApp] = useState(-1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [pendingAppId, setPendingAppId] = useState(null);

    let [nameVal, setNameVal] = useState("");
    let [roleVal, setRoleVal] = useState("");

    // handler functions for input fields
    const handleName = (event) => {
        setName(event.target.value);
    };

    const handleRoleSheet = (event) => {
        setRoleSheet(event.target.value);
    };

    const handleAppSelection = (app, i) => {
        setSelectedApp(app);
        setSelectedI(i);
    };

    const handleNameInput = (event) => {
        setNameVal(event.target.value);
    };

    const handleRolesheetInput = (event) => {
        setRoleVal(event.target.value);
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const handleRoleFilterChange = (event) => {
        setRoleFilter(event.target.value);
    };

    // the current logged in user
    const { user, globalDev } = useContext(AuthContext);

    // On component mount, get the list of apps belonging to the user from the api.
    // Store it in state.
    useEffect(() => {
        async function asyncGetApps() {
            setIsLoading(true);
            try {
                let response = await appAPI.getApps();
                if (response.data.success) {
                    setAppList(response.data.apps);
                    setError("");
                    setStatusMessage("");
                }
            } catch (e) {
                if (e.unauthorized) {
                    setError("Your session has expired. Please log in again.");
                } else {
                    setError("An unexpected error occurred while fetching apps.");
                }
            } finally {
                setIsLoading(false);
            }
        }
        asyncGetApps();
    }, []);

    useEffect(() => {
        // since it takes a moment for the sheet to be read into the state, the useeffect is used
        // useeffect is triggered when sheetInfo state is changed.
        if (sheetInfo.length > 0) {
            // if the 2d array actually has data.
            let columns = sheetInfo.map((column) => {
                // each element of 2d array is a column array
                let returnVal = {
                    // javascript object. check app schema for "roles"
                    name: column[0], // since its column-based, first element is always column name
                    members: column.slice(1), // everything from 2nd element (index 1) is emails
                };
                return returnVal;
            });

            // now that we have roles, we create app using api.createApp();
            async function asyncCreateApp() {
                try {
                    let response = await appAPI.createApp({
                        name: name,
                        roleSheet: roleSheet,
                        roles: columns, // roles is stored part of apps.
                        published: false,
                    });

                    if (response.data.success) {
                        setAppList((list) =>
                            list ? [...list, response.data.app] : [response.data.app]
                        );
                        setError("");
                        setStatusMessage(`Created app "${response.data.app.name}".`);
                    }
                } catch (e) {
                    if (e.unauthorized) {
                        setError("Your session has expired. Please log in again.");
                    } else if (e.data && e.data.errorMessage) {
                        setError(`Error from server for request:\n${e.data.errorMessage}`);
                    } else if (e.data && e.data.error && e.data.error._message) {
                        setError(`Error from server for request:\n${e.data.error._message}`);
                    } else if (e.data && e.data.error) {
                        setError(`Error from server for request:\n${e.data.error}`);
                    } else {
                        setError("An unexpected error occurred while contacting the server.");
                    }
                }
            }
            asyncCreateApp();
        }
    }, [name, roleSheet, sheetInfo]);

    // Create an app with the specified information from the input fields.
    // Creator is automatically set to the user's email.
    const createApp = async () => {
        try {
            let response = await sheetsAPI.sheetinfo(roleSheet);
            if (response.data.success) {
                setSheetInfo(response.data.sheet);
                setGid(response.data.gid);
                setError("");
                setStatusMessage("");
            } else {
                setError(response.data.errorMessage);
            }
        } catch (e) {
            if (e.unauthorized) {
                setError("Your session has expired. Please log in again.");
            } else if (e.data && e.data.errorMessage) {
                setError(e.data.errorMessage);
            } else {
                setError("An unexpected error occurred while contacting the server.");
            }
        }
    };

    const getUserAccessLabel = (app) => {
        if (app?.permissions?.isCreator) {
            return "Creator";
        }

        if (app?.permissions?.canManage) {
            return "Developer";
        }

        if (app?.permissions?.canView) {
            return "Viewer";
        }

        return "No access";
    };

    const decoratedApps = useMemo(() => {
        if (!Array.isArray(appList)) {
            return [];
        }

        return appList
            .map((app) => ({
                ...app,
                accessLabel: getUserAccessLabel(app),
                searchableText: `${app?.name || ""}`.toLowerCase(),
            }))
            .sort((a, b) => {
                const nameA = a?.name || "";
                const nameB = b?.name || "";
                return nameA.localeCompare(nameB);
            });
    }, [appList]);

    const filteredApps = useMemo(() => {
        const term = searchQuery.trim().toLowerCase();

        return decoratedApps.filter((app) => {
            const matchesSearch = term === "" || app.searchableText.includes(term);
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "published" && app.published === true) ||
                (statusFilter === "draft" && app.published !== true);
            const matchesRole = roleFilter === "all" || app.accessLabel === roleFilter;

            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [decoratedApps, searchQuery, statusFilter, roleFilter]);

    const updateAppInState = (updatedApp) => {
        setAppList((list) => {
            if (!Array.isArray(list)) {
                return list;
            }

            return list.map((existing) =>
                existing._id === updatedApp._id ? updatedApp : existing
            );
        });
    };

    const removeAppFromState = (appId) => {
        setAppList((list) => {
            if (!Array.isArray(list)) {
                return list;
            }

            return list.filter((existing) => existing._id !== appId);
        });
    };

    const setPendingFor = (appId) => {
        setPendingAppId(appId);
    };

    const clearPending = () => {
        setPendingAppId(null);
    };

    const togglePublished = async (app) => {
        if (!app?.permissions?.canManage) {
            return;
        }

        setPendingFor(app._id);
        setError("");
        setStatusMessage("");

        try {
            const response = await appAPI.updateApp({
                _id: app._id,
                published: !app.published,
            });

            if (response.data.success) {
                updateAppInState(response.data.app);
                setStatusMessage(
                    response.data.app.published
                        ? `Published "${response.data.app.name}".`
                        : `Unpublished "${response.data.app.name}".`
                );
            }
        } catch (e) {
            if (e.unauthorized) {
                setError("Your session has expired. Please log in again.");
            } else if (e.data && e.data.errorMessage) {
                setError(`Error from server for request:\n${e.data.errorMessage}`);
            } else if (e.data && e.data.error && e.data.error._message) {
                setError(`Error from server for request:\n${e.data.error._message}`);
            } else if (e.data && e.data.error) {
                setError(`Error from server for request:\n${e.data.error}`);
            } else {
                setError("An unexpected error occurred while contacting the server.");
            }
        } finally {
            clearPending();
        }
    };

    const buildCopyName = (baseName) => {
        const suffix = " (Copy)";
        if (!Array.isArray(appList)) {
            return `${baseName}${suffix}`;
        }

        let attempt = `${baseName}${suffix}`;
        let counter = 2;

        const existingNames = new Set(appList.map((app) => app?.name));

        while (existingNames.has(attempt)) {
            attempt = `${baseName}${suffix} ${counter}`;
            counter += 1;
        }

        return attempt;
    };

    const duplicateApp = async (app) => {
        if (!app?.permissions?.canManage) {
            return;
        }

        const originalName = app.name || "Untitled App";
        const copyName = buildCopyName(originalName);

        setPendingFor(app._id);
        setError("");
        setStatusMessage("");

        try {
            const response = await appAPI.createApp({
                name: copyName,
                roleSheet: app.roleSheet,
                roles: app.roles,
                dataSources: app.dataSources,
                view: app.view,
                published: false,
            });

            if (response.data.success) {
                setAppList((list) => (list ? [...list, response.data.app] : [response.data.app]));
                setStatusMessage(`Duplicated "${originalName}" as "${copyName}".`);
            }
        } catch (e) {
            if (e.unauthorized) {
                setError("Your session has expired. Please log in again.");
            } else if (e.data && e.data.errorMessage) {
                setError(`Error from server for request:\n${e.data.errorMessage}`);
            } else if (e.data && e.data.error && e.data.error._message) {
                setError(`Error from server for request:\n${e.data.error._message}`);
            } else if (e.data && e.data.error) {
                setError(`Error from server for request:\n${e.data.error}`);
            } else {
                setError("An unexpected error occurred while contacting the server.");
            }
        } finally {
            clearPending();
        }
    };

    const syncRoles = async (app) => {
        if (!app?.permissions?.canManage) {
            return;
        }

        setPendingFor(app._id);
        setError("");
        setStatusMessage("");

        try {
            const response = await appAPI.updateRoles({ _id: app._id });

            if (response.data.success) {
                updateAppInState(response.data.app);
                setStatusMessage(`Synced roles from sheet for "${response.data.app.name}".`);
            }
        } catch (e) {
            if (e.unauthorized) {
                setError("Your session has expired. Please log in again.");
            } else if (e.data && e.data.errorMessage) {
                setError(`Error from server for request:\n${e.data.errorMessage}`);
            } else if (e.data && e.data.error && e.data.error._message) {
                setError(`Error from server for request:\n${e.data.error._message}`);
            } else if (e.data && e.data.error) {
                setError(`Error from server for request:\n${e.data.error}`);
            } else {
                setError("An unexpected error occurred while contacting the server.");
            }
        } finally {
            clearPending();
        }
    };

    const archiveApp = async (app) => {
        if (!app?.permissions?.isCreator) {
            return;
        }

        const appName = app.name || "Untitled App";

        const confirmed = window.confirm(
            `Archive "${appName}"? This will remove it from your catalog until recreated.`
        );

        if (!confirmed) {
            return;
        }

        setPendingFor(app._id);
        setError("");
        setStatusMessage("");

        try {
            const response = await appAPI.deleteApp(app._id);

            if (response.data.success) {
                removeAppFromState(app._id);
                setStatusMessage(`Archived "${appName}".`);
            }
        } catch (e) {
            if (e.unauthorized) {
                setError("Your session has expired. Please log in again.");
            } else if (e.data && e.data.errorMessage) {
                setError(`Error from server for request:\n${e.data.errorMessage}`);
            } else if (e.data && e.data.error && e.data.error._message) {
                setError(`Error from server for request:\n${e.data.error._message}`);
            } else if (e.data && e.data.error) {
                setError(`Error from server for request:\n${e.data.error}`);
            } else {
                setError("An unexpected error occurred while contacting the server.");
            }
        } finally {
            clearPending();
        }
    };

    const appListElements = (
        <Box>
            <h3 className="make-app-header">Your Apps</h3>

            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    marginLeft: "50px",
                    marginBottom: 2,
                    alignItems: "center",
                }}
            >
                <TextField
                    label="Search apps"
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearch}
                    sx={[{ width: "260px" }, { ":hover": { backgroundColor: "#E7F2FF" } }]}
                />
                <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel id="app-status-filter-label">Publish status</InputLabel>
                    <Select
                        labelId="app-status-filter-label"
                        id="app-status-filter"
                        value={statusFilter}
                        label="Publish status"
                        onChange={handleStatusFilterChange}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel id="app-role-filter-label">Your role</InputLabel>
                    <Select
                        labelId="app-role-filter-label"
                        id="app-role-filter"
                        value={roleFilter}
                        label="Your role"
                        onChange={handleRoleFilterChange}
                    >
                        <MenuItem value="all">All roles</MenuItem>
                        <MenuItem value="Creator">Creator</MenuItem>
                        <MenuItem value="Developer">Developer</MenuItem>
                        <MenuItem value="Viewer">Viewer</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer>
                <Table sx={[{ width: "90%" }, { marginLeft: "50px" }]} size="medium">
                    <TableHead>
                        <TableRow sx={[{ border: 2 }, { th: { fontWeight: "bold" } }]}>
                            <TableCell>Name</TableCell>
                            <TableCell>Access</TableCell>
                            <TableCell align="center">Published</TableCell>
                            <TableCell>Roles</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody
                        sx={{
                            "tr:hover": {
                                backgroundColor: "#E7F2FF",
                            },
                        }}
                    >
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : filteredApps.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography variant="body1">
                                        {appList && appList.length > 0
                                            ? "No apps match your current filters."
                                            : "There are no existing apps or no apps that you have permission to access."}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredApps.map((app, i) => {
                                const isPending = pendingAppId === app._id;
                                const canManage = app.permissions?.canManage;
                                const roles = Array.isArray(app.roles)
                                    ? app.roles
                                          .filter((role) => role?.name)
                                          .map((role) => role.name)
                                    : [];

                                return (
                                    <TableRow key={app._id || i} sx={[{ td: { border: 1 } }]} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="subtitle1">
                                                    {app.name}
                                                </Typography>
                                                {app.permissions?.isCreator ? (
                                                    <Chip
                                                        color="primary"
                                                        size="small"
                                                        label="Owner"
                                                    />
                                                ) : null}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Chip size="small" label={app.accessLabel} />
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Switch
                                                    checked={app.published === true}
                                                    onChange={() => togglePublished(app)}
                                                    color="primary"
                                                    disabled={!canManage || isPending}
                                                />
                                                <Typography variant="body2">
                                                    {app.published ? "Published" : "Draft"}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                {roles.length > 0 ? (
                                                    roles.map((role) => (
                                                        <Chip
                                                            key={`${app._id}-${role}`}
                                                            label={role}
                                                            size="small"
                                                        />
                                                    ))
                                                ) : (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        No roles available
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                justifyContent="flex-end"
                                                alignItems="center"
                                            >
                                                <Tooltip title="Open builder">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleAppSelection(app, i)
                                                            }
                                                            disabled={isPending}
                                                        >
                                                            <OpenInNewIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Duplicate app">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => duplicateApp(app)}
                                                            disabled={!canManage || isPending}
                                                        >
                                                            <ContentCopyIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Sync roles from sheet">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => syncRoles(app)}
                                                            disabled={!canManage || isPending}
                                                        >
                                                            <SyncIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Archive app">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => archiveApp(app)}
                                                            disabled={
                                                                !app.permissions?.isCreator ||
                                                                isPending
                                                            }
                                                        >
                                                            <ArchiveIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                {isPending ? <CircularProgress size={20} /> : null}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
    let createAppElements;
    if (globalDev) {
        createAppElements = (
            <div>
                <h3 className="make-app-header">Make an app</h3>

                <TextField
                    id="outlined-basic-name"
                    sx={[
                        { width: "20%" },
                        { marginLeft: "50px" },
                        { ":hover": { backgroundColor: "#E7F2FF" } },
                    ]}
                    label="App name"
                    variant="outlined"
                    onChange={handleName}
                    onInput={handleNameInput}
                />
                <br />
                <br />
                <TextField
                    id="outlined-basic-url"
                    sx={[
                        { width: "40%" },
                        { marginLeft: "50px" },
                        { ":hover": { backgroundColor: "#E7F2FF" } },
                    ]}
                    label="App's rolesheet URL"
                    variant="outlined"
                    onChange={handleRoleSheet}
                    onInput={handleRolesheetInput}
                />
                <Button
                    onClick={createApp}
                    sx={[
                        { marginLeft: "25px" },
                        { height: "56px" },
                        { border: 1 },
                        { backgroundColor: "##B1BCC8" },
                        { ":hover": { backgroundColor: "#438AD8" } },
                        { ":hover": { color: "white" } },
                    ]}
                    disabled={!name || !roleSheet}
                >
                    Create App
                </Button>
            </div>
        );
    }

    // Display controls for creating an app.
    // Display the app list if it is not empty.
    if (selectedApp !== undefined) {
        return (
            <App
                app={selectedApp}
                running={activeApp === selectedI}
                setRunning={() => {
                    if (activeApp === selectedI) {
                        setActiveApp(-1);
                    } else setActiveApp(selectedI);
                }}
                goBack={() => {
                    setSelectedApp(undefined);
                }}
            />
        );
    } else {
        return (
            <Box sx={{ paddingBottom: 4 }}>
                {createAppElements}
                <br />
                <br />
                <br />
                {error ? (
                    <Box sx={{ marginLeft: "50px", color: "#d32f2f", whiteSpace: "pre-line" }}>
                        {error}
                    </Box>
                ) : null}
                {statusMessage ? (
                    <Box sx={{ marginLeft: "50px", color: "#1b5e20", marginTop: 1 }}>
                        {statusMessage}
                    </Box>
                ) : null}
                {appListElements}
            </Box>
        );
    }
}
