import { useState, useContext, useEffect } from "react";
import appAPI from "../../api/app";
import sheetsAPI from "../../api/sheets";

import { AuthContext } from "../../context/auth";
import { TextField, Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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

	// the current logged in user
	const { user, token, globalDev } = useContext(AuthContext);

	// On component mount, get the list of apps belonging to the user from the api.
	// Store it in state.
	useEffect(() => {
		async function asyncGetApps() {
			let response = await appAPI.getApps();
			if (response.data.success) {
				if (appList) {
					setAppList((a) => [...a, response.data.apps]);
				} else {
					setAppList([...response.data.apps]);
				}
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
				let response = await appAPI.createApp({
					name: name,
					creator: user.email,
					roleSheet: roleSheet,
					roles: columns, // roles is stored part of apps.
					published: false,
				});

				// If successful, append the app to the app list.
				if (response.data.success) {
					if (appList) {
						setAppList([...appList, response.data.app]);
					} else {
						setAppList([response.data.app]);
					}
				}
			}
			asyncCreateApp();
		}
	}, [sheetInfo]);

	// Create an app with the specified information from the input fields.
	// Creator is automatically set to the user's email.
	const createApp = async () => {
		// when button is clicked, the rolesheet URL is read into the system using api call.
		let response = await sheetsAPI.sheetinfo(token, roleSheet);
		// if success, set the state to the 2d array of the sheet and gid
		if (response.data.success) {
			setSheetInfo(response.data.sheet);
			setGid(response.data.gid);
		} else {
			setError(response.data.errorMessage);
		}
	};

	// Map the appList to an array of App components.
	// Pass each component an app object and set its key to its index in the list.
	/*let appListElements = [];
	if (appList) {
		appListElements = appList.map((app, i) => {
			return (
				<div key={i}>
					<App
						app={app}
						running={activeApp === i}
						setRunning={() => {
							if (activeApp === i) {
								setActiveApp(-1);
							} else setActiveApp(i);
						}}
					/>
				</div>
			);
		});
	}*/

	let appListElements = (
		<div style={{ marginLeft: "25px" }}>
			<h3>
				<strong>
					There are no existing apps or no apps that you have permission to
					access.
				</strong>
			</h3>
		</div>
	);
	let userType = [];
	let boolHolder = [];
	if (appList !== undefined) {
		for (let i = 0; i < appList.length; i++) {
			let app = appList[i];
			for (let role of app.roles) {
				if (role.members.includes(user.email)) {
					if (role.name === "Developer") {
						userType[i] = "dev";
						break;
					} else if (app.published !== undefined && app.published !== false) {
						userType[i] = "end";
					} else {
						userType[i] = "no access";
					}
				}
			}
		}
		for (let i = 0; i < userType.length; i++) {
			if (userType[i] !== "no access")
				boolHolder[i] = globalDev
					? true
					: userType[i] === "dev"
					? true
					: userType[i] === "end"
					? true
					: false;
		}
	}
	if (
		appList !== undefined &&
		appList.length > 0 &&
		(boolHolder.length !== 0 || globalDev)
	) {
		appListElements = (
			<div>
				<h3 className="make-app-header">Your Apps</h3>

				<TableContainer>
					<Table
						sx={[{ width: "80%" }, { marginLeft: "50px" }]}
						size="medium"
					>
						<TableHead>
							<TableRow sx={[{ border: 2 }, { th: { fontWeight: "bold" } }]}>
								<TableCell>App Name</TableCell>
								<TableCell align="left">Creator</TableCell>
								<TableCell align="right">Published</TableCell>
							</TableRow>
						</TableHead>
						<TableBody
							sx={{
								"tr:hover": {
									backgroundColor: "#E7F2FF",
									border: 1,
								},
							}}
						>
							{appList.map((app, i) => {
								if (boolHolder[i]) {
									return (
										<TableRow
											key={i}
											sx={[
												{ td: { border: 1 } },
												{ "td:hover": { color: "black" } },
											]}
											onClick={() => handleAppSelection(app, i)}
											display="none"
										>
											<TableCell scope="appName">{app.name}</TableCell>
											<TableCell align="left">{app.creator}</TableCell>
											<TableCell align="right">
												{app.published === undefined
													? ""
													: app.published
													? "Yes"
													: "No"}
											</TableCell>
										</TableRow>
									);
								}
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		);
	}

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
			<div>
				{createAppElements}
				<br />
				<br />
				<br />
				{appListElements}
			</div>
		);
	}
}
