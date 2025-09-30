import dataAPI from "../../api/data";
import viewAPI from "../../api/view";

import TableView from "./TableView";
import DetailView from "./DetailView";
import sheetsAPI from "../../api/sheets";

import { useState, useEffect, useContext, useRef } from "react";

import { Button } from "@mui/material";

import { AuthContext } from "../../context/auth";

export default function View(props) {
	// Get the constructed view object from props.
	let viewId = props.view;

	// current user info from context.
	const { user } = useContext(AuthContext);

	// store table in state as 2D array.
	let [table, setTable] = useState();
	let [view, setView] = useState();
	let [tableCols, setTableCols] = useState([]);
	let [sheetURL, setSheetURL] = useState("");

	let [tableKey, setTableKey] = useState();

	let [userCanView, setUserCanView] = useState();

	let viewElements = useRef();

	// Refresh the view data when the id changes.
	useEffect(() => {
		if (viewId) {
			getView(viewId);
		}
	}, [viewId]);

	// Refresh the table data every time the view prop is updated.
	useEffect(() => {
		if (view) {
			getTable(view.table);
		}
	}, [view]);

	// set whether user has permission to see the view.
	useEffect(() => {
		if (view && props.roles) {
			for (let appRole of props.roles) {
				for (let i = 0; i < view.roles.length; i++) {
					if (
						appRole.name === view.roles[i] &&
						appRole.members.includes(user.email)
					) {
						setUserCanView(true);
						break;
					}
				}
			}
		}
	}, [view, props.roles]);

	useEffect(() => {
		if (view && table) {
			viewElements.current = getElements();
		}
	}, [table]);

	// Retrieve a view from the database by its id. Append it to the views list.
        async function getView(id) {
                try {
                        let response = await viewAPI.getViewById(id);
                        if (response.data.success) {
                                setView(response.data.view);
                        }
                } catch (e) {
                        if (e.unauthorized) {
                                console.warn("Session expired while loading view data.");
                        } else {
                                console.error(e);
                        }
                }
        }

        // get the table data from backend using the object id.
        let getTable = async (id) => {
                try {
                        let response = await dataAPI.getDataSourceById(id);
                        if (response.data.success) {
                                setTable([...response.data.data]);
                                setTableCols(response.data.ds.columns);
                                setSheetURL(response.data.ds.url);
                                setTableKey(response.data.ds.key);
                        }
                } catch (e) {
                        if (e.unauthorized) {
                                console.warn("Session expired while loading table data.");
                        } else {
                                console.error(e);
                        }
                }
        };

        async function deleteEntry(i) {
                let valArr = table.map((col) => "");
                try {
                        await sheetsAPI.editSheet(sheetURL, valArr, i + 1);
                        appendCol();
                } catch (e) {
                        if (e.unauthorized) {
                                console.warn("Session expired while deleting entry.");
                        } else {
                                console.error(e);
                        }
                }
        }

	// extract the columns that belong in this view.
	// Format them as JSX table elements.

	function getElements() {
		let columns = view.columns;

		// we will calculate the maximum column length.
		let colData = [];
		let elements = [];

		let maxLen = 0;

		let editFilter;
		let userFilter;
		let filter;

		if (view.editFilter) {
			for (let i = 0; i < table.length; i++) {
				if (table[i][0] === view.editFilter) editFilter = i;
			}
		}

		if (view.userFilter) {
			for (let i = 0; i < table.length; i++) {
				if (table[i][0] === view.userFilter) userFilter = i;
			}
		}

		if (view.filter) {
			for (let i = 0; i < table.length; i++) {
				if (table[i][0] === view.filter) filter = i;
			}
		}

		colData = [...table];
		for (let i = 0; i < colData.length; i++) {
			if (colData[i].length > maxLen) maxLen = colData[i].length;
			if (!view.columns.includes(colData[i][0])) {
				colData[i] = null;
			}
		}

		// Iterate through each record.
		// The number of records equals the length of the longest column.
		// This allows for columns of different lengths in the table.
		for (let i = 0; i < maxLen; i++) {
			let tds = [];

			// Iterate through each data point in the record.
			// Make a td element for each one.
			for (let j = 0; j < colData.length; j++) {
				if (colData[j] === null) continue;
				let colType = "";
				for (let k = 0; k < tableCols.length; k++) {
					if (tableCols[k].name === columns[j]) {
						colType = tableCols[k].type;
					}
				}
				// push a table cell for the table data
				// if the col is type URL, wrap it in <a>
				tds.push({
					td: (
						<td
							key={j}
							style={{ border: "1px solid black", borderCollapse: "collapse" }}
						>
							{colType === "URL" && i > 0 ? (
								<a
									href={colData[j][i]}
									target="_blank"
									rel="noopener noreferrer" // prevents phishing attacks (https://www.freecodecamp.org/news/how-to-use-html-to-open-link-in-new-tab/)"
								>
									{colData[j][i]}
								</a>
							) : (
								colData[j][i]
							)}
						</td>
					),
				});
			}

			// Make a tr element for the record containing all the td's.
			// Append a cell containing a button for detail view
			elements.push({
				key: i,
				canEdit: editFilter ? table[editFilter][i] === "TRUE" : true,
				tr: (
					<tr key={i}>
						{tds.map((td) => {
							return td.td;
						})}
						{view.type === "table" && i > 0 ? (
							<td
								style={{
									border: "1px solid black",
									borderCollapse: "collapse",
								}}
							>
								<Button
									onClick={() => {
										props.setDetailEntry(i);
										props.setDetailTable(view.table);
									}}
								>
									Detail
								</Button>
							</td>
						) : (
							""
						)}
						{i > 0 && view.allowedActions.includes("delete") ? (
							<td
								style={{
									border: "1px solid black",
									borderCollapse: "collapse",
								}}
							>
								<Button
									onClick={() => {
										deleteEntry(i);
									}}
								>
									Delete
								</Button>
							</td>
						) : (
							""
						)}
					</tr>
				),
			});

			if (filter) {
				elements = elements.filter((elem) => {
					return table[filter][elem.key] === "TRUE";
				});
			}

			if (userFilter) {
				elements = elements.filter((elem) => {
					return table[userFilter][elem.key] === user.email;
				});
			}
		}

		// Return the array of JSX elements.
		return elements;
	}

	function addRecord(lastIndex) {
		console.log(lastIndex);
		props.setDetailEntry(lastIndex);
		props.setDetailTable(view.table);
	}

	let appendCol = async () => {
		await getTable(view.table);
	};

	// Create the view component depending on type, only if user has permission
	let viewData;
	if (view && table && viewElements.current && userCanView) {
		let maxLen = 0;

		for (let i = 0; i < table.length; i++) {
			if (table[i].length > maxLen) maxLen = table[i].length;
		}

		switch (view.type) {
			case "table":
				viewData = (
					<TableView
						elements={viewElements.current}
						name={view.name}
						addRecord={addRecord}
						allowedActions={view.allowedActions}
						maxLen={maxLen}
					/>
				);
				break;
			case "detail":
				viewData = (
					<DetailView
						name={view.name}
						elements={viewElements.current}
						detailEntry={props.detailEntry}
						table={view.table}
						detailTable={props.detailTable}
						exit={() => {
							props.setDetailEntry(-1);
						}}
						sheetURL={sheetURL}
						nCols={table.length}
						appendCol={appendCol}
						allowedActions={view.allowedActions}
						editableCols={view.editableCols}
						tableCols={tableCols}
						tableKey={tableKey}
					/>
				);
				break;
			default:
				<p>Invalid View Type</p>;
		}
	}

	// Return the view component and, if user is dev, information about the view.
	if (
		view &&
		view.columns &&
		view.allowedActions &&
		view.editableCols &&
		props.userType === "dev"
	) {
		return (
			<div>
				<p>Name: {view.name}</p>
				<p>Columns:</p>
				<ul>
					{view.columns.map((col, index) => {
						return <li key={index}>{col}</li>;
					})}
				</ul>
				<p>Allowed Actions: </p>
				<ul>
					{view.allowedActions.map((acc, index) => {
						return <li key={index}>{acc}</li>;
					})}
				</ul>
				<p>Editable Columns: </p>
				<ul>
					{view.editableCols.map((col, index) => {
						return <li key={index}>{col}</li>;
					})}
				</ul>
				{viewData}
			</div>
		);
	} else if (
		// if user is not dev, return only viewData
		view &&
		view.columns &&
		view.allowedActions &&
		view.editableCols &&
		userCanView
	) {
		return <div>{viewData}</div>;
	}
}
