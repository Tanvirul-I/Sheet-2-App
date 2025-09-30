/**
 * Components/App/index.js
 * Returns :
 * the information about each app,
 * the apps views,
 * the fields for adding views and data sources
 **/

import { useState, useContext, useEffect } from 'react';
import {
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormGroup,
	FormControlLabel,
	Switch,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Modal,
	Box,
	Typography
} from '@mui/material';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import viewAPI from '../../api/view';
import appAPI, { updateApp } from '../../api/app';
import dataAPI from '../../api/data';

import DataSources from '../DataSources/DataSources';
import View from '../View/View';
import { AuthContext } from '../../context/auth';

export default function App(props) {
	// Get the app object from props.
	let app = props.app;

	// State variables for the input fields for creating view.
	let [viewName, setViewName] = useState('');
	let [viewTable, setViewTable] = useState('');
	let [viewColumns, setViewColumns] = useState([]);
	let [viewAllowedActions, setViewAllowedActions] = useState([]);
	let [viewType, setViewType] = useState('');
	let [viewRoles, setViewRoles] = useState([]);
	let [viewEditableColumns, setViewEditableColumns] = useState([]);
	let [viewEditFilter, setViewEditFilter] = useState();
	let [viewFilter, setViewFilter] = useState();
	let [viewUserFilter, setViewUserFilter] = useState();

	let [detailEntry, setDetailEntry] = useState(-1);
	let [detailTable, setDetailTable] = useState();

	// state for table specific options
	let [tableOptions, setTableOptions] = useState([]);

	// state for userType
	let [userType, setUserType] = useState();
	let [appName, setAppName] = useState(app.name);
	let [displayAppName, setDisplayAppName] = useState(app.name);
	let [appRolesheet, setAppRolesheet] = useState(app.roleSheet);
	let [appPublished, setAppPublished] = useState();

	let [appOpen, setAppOpen] = useState(false);
	let [rolesheetOpen, setRoleSheetOpen] = useState(false);
	const handleAppOpen = () => setAppOpen(true);
	const handleAppClose = () => setAppOpen(false);
	const handleAppSave = () => {
		handleSave();
		handleAppClose();
	};

	const handleRolesheetOpen = () => setRoleSheetOpen(true);
	const handleRolesheetClose = () => setRoleSheetOpen(false);
	const handleRolesheet = (event) => setAppRolesheet(event.target.value);
	const handleRolesheetSave = () => {
		handleSave();
		handleRolesheetClose();
	};

	const handleSave = async () => {
		let response = await appAPI.updateApp({
			_id: app._id,
			name: appName,
			roleSheet: appRolesheet
		});

		if (response.data.success) {
			app = response.data.app;
			setDisplayAppName(app.name);
			setAppName(app.name);
			setAppRolesheet(app.roleSheet);
		}
	};
	const [dss, setDss] = useState({});
	const [dssArr, setDssArr] = useState([]);

	// Handler functions for input fields.
	const handleViewName = (event) => {
		setViewName(event.target.value);
	};

	// get the user object from auth context
	const { user } = useContext(AuthContext);

	// get updated roles for the app on mount
	useEffect(() => {
		async function updateRoles() {
			let response = await appAPI.updateRoles({
				_id: app._id
			});

			if (response.data.success) {
				if (response.data.app) app = response.data.app;
			}
		}
		updateRoles();
	}, []);

	useEffect(() => {
		async function asyncGetTables(id) {
			let response = await dataAPI.getDataSourceById(id);
			if (response.data.success) {
				setDss({
					...dss,
					[id]: (
						<div>
							<p>Name: {response.data.ds.name}</p>
							<p>URL: {response.data.ds.url}</p>
							<p>GID: {response.data.ds.GID}</p>
							<p>Key: {response.data.ds.key}</p>
						</div>
					)
				});
			}
		}
		for (let i = 0; i < app.dataSources.length; i++) asyncGetTables(app.dataSources[i]);

		for (let i = 0; i < app.dataSources.length; i++) {
			let ret = [];
			ret.push(dss[app.dataSources[i]]);
			setDssArr(ret);
		}
	}, [app.dataSources]);

	// Create a View with the specified information. Store it in the database,
	// append it to the views list, and append it to the app's views list.
	const createView = () => {
		async function asyncCreateView() {
			let roleNames = [];
			for (let role of viewRoles) {
				roleNames.push(role.name);
			}
			let response = await viewAPI.createView({
				name: viewName,
				table: viewTable._id,
				columns: viewColumns,
				allowedActions: viewAllowedActions,
				type: viewType,
				roles: roleNames,
				filter: viewFilter,
				userFilter: viewUserFilter,
				editFilter: viewEditFilter,
				editableCols: viewEditableColumns
			});
			if (response.data.success) {
				if (!app.view) {
					app.view = [response.data.view._id];
				} else {
					app.view.push(response.data.view._id);
				}
				await appAPI.updateApp({ _id: app._id, view: app.view });
				if (response.data.success) {
					// props.setApp()
				}
			}
		}
		asyncCreateView();
	};

	// get data source for the table
	useEffect(() => {
		async function asyncGetTables() {
			for (let table of app.dataSources) {
				let response = await dataAPI.getDataSourceById(table);
				if (response.data.success) {
					if (tableOptions) {
						setTableOptions((t) => [...t, response.data.ds]);
					} else {
						setTableOptions([response.data.ds]);
					}
				}
			}
		}
		asyncGetTables();
	}, [app.dataSources]);

	let optionItems;
	if (tableOptions) {
		optionItems = tableOptions.map((table, index) => {
			return (
				<MenuItem key={index} value={table}>
					{table.name}
				</MenuItem>
			);
		});
	}

	useEffect(() => {
		if (app) {
			if (app.permissions?.canManage) {
				setUserType('dev');
				return;
			}

			let type = 'no access';

			if (Array.isArray(app.roles)) {
				for (let role of app.roles) {
					if (Array.isArray(role.members) && role.members.includes(user.email)) {
						type = role.name === 'Developer' ? 'dev' : 'end';
						break;
					}
				}
			}

			if (type === 'no access' && app.permissions?.canView) {
				type = 'end';
			}

			setUserType(type);
		}
	}, [app, user.email]);

	useEffect(() => {
		if (app) {
			setAppPublished(app.published);
		}
	}, [app.published]);

	// Make a view element for each view id in the app's list.
	let viewsElements = [];
	if (app.view) {
		viewsElements = app.view.map((view, index) => {
			return (
				<View
					view={view}
					key={index + 1}
					roles={app.roles}
					userType={userType}
					detailEntry={detailEntry}
					setDetailEntry={setDetailEntry}
					detailTable={detailTable}
					setDetailTable={setDetailTable}
				/>
			);
		});
		viewsElements.unshift(<p key={0}>Views</p>);
	}

	let tableSpecificControls;

	if (viewTable) {
		tableSpecificControls = (
			<div>
				<FormControl>
					<InputLabel id="columns-label">Columns</InputLabel>
					<Select
						labelId="columns-select-label"
						id="columns-select"
						value={viewColumns ? viewColumns : ''}
						label="Columns"
						onChange={(event) => {
							setViewColumns(
								typeof event.target.value === 'string'
									? event.target.value.split(',')
									: event.target.value
							);
						}}
						multiple
					>
						{viewTable.columns.map((column, index) => {
							return (
								<MenuItem value={column.name} key={index}>
									{column.name}
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>
				<FormControl>
					<InputLabel id="type-label">Type</InputLabel>
					<Select
						labelId="type-select-label"
						id="type-select"
						value={viewType ? viewType : ''}
						label="Type"
						onChange={(event) => {
							setViewType(event.target.value);
							setViewEditFilter();
							setViewEditableColumns([]);
							setViewFilter();
							setViewUserFilter();
						}}
					>
						<MenuItem value={'table'}>Table</MenuItem>
						<MenuItem value={'detail'}>Detail</MenuItem>
					</Select>
				</FormControl>
			</div>
		);
	}

	let typeSpecificControls;

	if (viewType != '' && viewTable) {
		switch (viewType) {
			case 'detail':
				if (viewAllowedActions && viewAllowedActions.includes('edit'))
					typeSpecificControls = (
						<div>
							<FormControl>
								<InputLabel id="editable-columns-label">
									Editable Columns
								</InputLabel>
								<Select
									labelId="editable-columns-select-label"
									id="editable-columns-select"
									value={viewEditableColumns ? viewEditableColumns : ''}
									label="Editable Columns"
									onChange={(event) => {
										setViewEditableColumns(
											typeof event.target.value === 'string'
												? event.target.value.split(',')
												: event.target.value
										);
									}}
									multiple
								>
									{viewTable.columns
										.filter((column) => {
											return viewColumns.includes(column.name);
										})
										.map((column, index) => {
											return (
												<MenuItem value={column.name} key={index}>
													{column.name}
												</MenuItem>
											);
										})}
								</Select>
							</FormControl>
							<FormControl>
								<InputLabel id="edit-filer-label">Edit Filter</InputLabel>
								<Select
									labelId="edit-filter-select-label"
									id="edit-filter-select"
									value={viewEditFilter ? viewEditFilter : ''}
									label="Edit Filter"
									onChange={(event) => {
										setViewEditFilter(event.target.value);
									}}
								>
									{viewTable.columns
										.filter((column) => {
											return (
												viewColumns.includes(column.name) &&
												column.type === 'boolean'
											);
										})
										.map((column, index) => {
											return (
												<MenuItem value={column.name} key={index}>
													{column.name}
												</MenuItem>
											);
										})}
								</Select>
							</FormControl>
						</div>
					);
				break;

			case 'table': {
				typeSpecificControls = (
					<div>
						<FormControl>
							<InputLabel id="fitler-label">Filter</InputLabel>
							<Select
								labelId="filter-select-label"
								id="filter-select"
								value={viewFilter ? viewFilter : ''}
								label="Filter"
								onChange={(event) => {
									setViewFilter(event.target.value);
								}}
							>
								{viewTable.columns
									.filter((column) => {
										return (
											viewColumns.includes(column.name) &&
											column.type === 'boolean'
										);
									})
									.map((column, index) => {
										return (
											<MenuItem value={column.name} key={index}>
												{column.name}
											</MenuItem>
										);
									})}
							</Select>
						</FormControl>
						<FormControl>
							<InputLabel id="user-fitler-label">User Filter</InputLabel>
							<Select
								labelId="user-filter-select-label"
								id="user-filter-select"
								value={viewUserFilter ? viewUserFilter : ''}
								label="User Filter"
								onChange={(event) => {
									setViewUserFilter(event.target.value);
								}}
							>
								{viewTable.columns
									.filter((column) => {
										return (
											viewColumns.includes(column.name) &&
											column.type === 'text'
										);
									})
									.map((column, index) => {
										return (
											<MenuItem value={column.name} key={index}>
												{column.name}
											</MenuItem>
										);
									})}
							</Select>
						</FormControl>
					</div>
				);
				break;
			}
		}
	}

	// Controls for adding a view.
	// Only show this if the app has at least one datasource.
	let addView;
	if (userType === 'dev')
		addView =
			app.dataSources && app.dataSources.length > 0 ? (
				<div>
					<p>Add View</p>
					<TextField
						id="outlined-basic"
						label="name"
						variant="outlined"
						onChange={handleViewName}
					/>
					<FormControl>
						<InputLabel id="table-label">Table</InputLabel>
						<Select
							labelId="table-select-label"
							id="table-select"
							value={viewTable ? viewTable : ''}
							label="Table"
							onChange={(event) => {
								setViewTable(event.target.value);
							}}
						>
							{optionItems}
						</Select>
					</FormControl>
					{tableSpecificControls}

					<FormControl>
						<InputLabel id="allowed-actions-label">Actions</InputLabel>
						<Select
							labelId="allowed-actions-select-label"
							id="allowed-actions-select"
							value={viewAllowedActions ? viewAllowedActions : ''}
							label="Allowed Actions"
							onChange={(event) => {
								setViewAllowedActions(
									typeof event.target.value === 'string'
										? event.target.value.split(',')
										: event.target.value
								);
							}}
							multiple
						>
							<MenuItem value={'add'}>Add</MenuItem>
							<MenuItem value={'edit'}>Edit</MenuItem>
							<MenuItem value={'delete'}>Delete</MenuItem>
						</Select>
					</FormControl>
					{typeSpecificControls}
					<FormControl>
						<InputLabel id="roles-label">Roles</InputLabel>
						<Select
							labelId="roles-select-label"
							id="roles-select"
							value={viewRoles ? viewRoles : ''}
							label="Roles"
							onChange={(event) => {
								setViewRoles(event.target.value);
							}}
							multiple
						>
							{app.roles.map((role, index) => {
								return (
									<MenuItem key={index} value={role}>
										{role.name}
									</MenuItem>
								);
							})}
						</Select>
					</FormControl>
					<Button onClick={createView}>Create View</Button>
				</div>
			) : (
				<p>No DataSource</p>
			);

	let dataSourceElements;
	if (userType === 'dev') {
		dataSourceElements = (
			<div>
				<h2 id="app-component-bottom-header">Add a Data Source</h2>
				<DataSources app={app} />
			</div>
		);
	}

	if (userType === 'dev' || (userType === 'end' && app.published)) {
		return (
			<div id="app-component">
				<IconButton onClick={props.goBack}>
					<ArrowBackIosIcon />
				</IconButton>
				<div className="app-component-top">
					<div className="app-component-top-part" id="app-component-app-details">
						<h2>App Details</h2>
						<p>
							App Name: {displayAppName}{' '}
							{userType === 'dev' ? (
								<IconButton onClick={handleAppOpen}>
									<EditIcon />
								</IconButton>
							) : (
								''
							)}
							<Modal
								open={appOpen}
								close={handleAppClose}
								aria-labelledby="modal-app-name"
								aria-describedby="modal-app-description"
							>
								<Box
									sx={[
										{ position: 'absolute' },
										{ top: '50%' },
										{ left: '50%' },
										{ transform: 'translate(-50%, -50%)' },
										{ width: 400 },
										{ bgcolor: 'background.paper' },
										{ border: '2px solid #000' },
										{ boxShadow: 24 },
										{ p: 4 }
									]}
								>
									<IconButton
										onClick={handleAppClose}
										sx={[
											{ position: 'absolute' },
											{ top: '0%' },
											{ left: '0%' }
										]}
									>
										<CloseIcon />
									</IconButton>
									<IconButton
										onClick={handleAppSave}
										sx={[
											{ position: 'absolute' },
											{ top: '0%' },
											{ right: '0%' }
										]}
										disabled={
											appName == app.name
												? true
												: appName == ''
													? true
													: false
										}
									>
										<DoneIcon />
									</IconButton>
									<Typography id="modal-app-name" variant="h6" component="h2">
										Edit App Name
									</Typography>
									<TextField
										id="outlined-basic"
										sx={[
											{ width: '80%' },
											{ ':hover': { backgroundColor: 'lightgray' } }
										]}
										value={appName}
										variant="outlined"
										onChange={(event) => {
											setAppName(event.target.value);
										}}
									/>
								</Box>
							</Modal>{' '}
						</p>
						<p>
							Access Level:{' '}
							{app.permissions?.isCreator
								? 'Owner'
								: userType === 'dev'
									? 'Developer'
									: userType === 'end'
										? 'End User'
										: 'No access'}
						</p>
						{app.permissions?.canManage && (
							<p>
								Rolesheet URL: {app.roleSheet}{' '}
								<IconButton onClick={handleRolesheetOpen}>
									<EditIcon />
								</IconButton>
								<Modal
									open={rolesheetOpen}
									close={handleRolesheetClose}
									aria-labelledby="modal-app-rolesheet"
									aria-describedby="modal-app-roledesc"
								>
									<Box
										sx={[
											{ position: 'absolute' },
											{ top: '50%' },
											{ left: '50%' },
											{ transform: 'translate(-50%, -50%)' },
											{ width: 800 },
											{ bgcolor: 'background.paper' },
											{ border: '2px solid #000' },
											{ boxShadow: 24 },
											{ p: 4 }
										]}
									>
										<IconButton
											onClick={handleRolesheetClose}
											sx={[
												{ position: 'absolute' },
												{ top: '0%' },
												{ left: '0%' }
											]}
										>
											<CloseIcon />
										</IconButton>
										<IconButton
											onClick={handleRolesheetSave}
											sx={[
												{ position: 'absolute' },
												{ top: '0%' },
												{ right: '0%' }
											]}
											disabled={
												appRolesheet == app.roleSheet || appRolesheet == ''
													? true
													: false
											}
										>
											<DoneIcon />
										</IconButton>
										<Typography
											id="modal-app-rolesheet"
											variant="h6"
											component="h2"
										>
											Edit Rolesheet URL
										</Typography>
										<TextField
											id="outlined-basic"
											sx={[
												{ width: '80%' },
												{ ':hover': { backgroundColor: 'lightgray' } }
											]}
											value={appRolesheet}
											onChange={(event) => {
												setAppRolesheet(event.target.value);
											}}
											variant="outlined"
										/>
									</Box>
								</Modal>
							</p>
						)}
					</div>
					<div className="app-component-top-part" id="app-component-app-controls">
						<h2 className="app-component-header">App Controls</h2>
						<div className="app-controls">
							<p>Published</p>
							{userType === 'dev' ? (
								<div className="switch">
									<FormGroup>
										<FormControlLabel
											id="published"
											control={
												<Switch
													sx={[{ justifyContent: 'right' }]}
													checked={appPublished}
													onChange={(event) => {
														if (app) {
															async function asyncUpdateApp() {
																let response =
																	await appAPI.updateApp({
																		_id: app._id,
																		published:
																			event.target.checked
																	});
																if (response.data.success) {
																	setAppPublished(
																		response.data.app.published
																	);
																}
															}
															asyncUpdateApp();
														}
													}}
												/>
											}
										/>
									</FormGroup>
								</div>
							) : (
								<p>Published: {app.published ? 'Yes' : 'No'}</p>
							)}
						</div>
					</div>
				</div>
				<div id="app-component-bottom">
					<div id="app-component-viewselements">{viewsElements}</div>
					<div>{dssArr ? dssArr : ''}</div>
					<div id="app-component-datasource">{dataSourceElements}</div>
					<div id="app-component-addview">{addView}</div>
				</div>
			</div>
		);
	}

	console.log(userType + app.name);
}
