import { Button, TextField } from "@mui/material";
import { useState } from "react";
import sheetsAPI from "../../api/sheets";

export default function View(props) {
    let elements = props.elements;
    let allowedActions = props.allowedActions;
    let tableCols = props.tableCols;
    let tableKey = props.tableKey;

    let [inputs, setInputs] = useState({});
    let [isEditing, setEditing] = useState(false);

    let borderStyle = {
        border: "1px solid black",
        borderCollapse: "collapse",
    };

    function getValues() {
        let ret = [];
        for (let i = 0; i < props.nCols; i++) {
            if (inputs[i] && inputs[i] !== "") {
                ret[i] = inputs[i];
            } else {
                ret[i] = "";
            }
        }
        return ret;
    }

    async function submitEdit() {
        let valArr = getValues();

        for (let i = 0; i < valArr.length; i++) {
            if (valArr[i] === "") continue;
            console.log(valArr);
            let match;
            switch (tableCols[i].type) {
                case "text":
                    if (elements[0].tr.props.children[0][i].props.children === tableKey) {
                        for (let j = 0; j < elements.length; j++) {
                            console.log(elements[j]);
                            if (elements[j].tr.props.children[0][i].props.children === valArr[i]) {
                                console.warn("BAD KEY");
                                return;
                            }
                        }
                    }
                    break;
                case "number":
                    match = valArr[i].match(/([0-9]*)/g);
                    if (!match || !match.includes(valArr[i])) {
                        console.warn("Not a number!");
                        return;
                    }
                    break;
                case "URL":
                    match = valArr[i].match(/https?:\/\/www\.\S*\.\w*/g);
                    if (!match || !match.includes(valArr[i])) {
                        console.warn("Not a URL!");
                        return;
                    }
                    break;
                case "boolean":
                    match = valArr[i].match(/(true|false)/gi);
                    if (!match || !match.includes(valArr[i])) {
                        console.warn("Not a Boolean!");
                        return;
                    }
                    break;
            }
        }
        try {
            await sheetsAPI.editSheet(props.sheetURL, valArr, props.detailEntry);
            await props.appendCol();
            setEditing((e) => !e);
        } catch (e) {
            if (e.unauthorized) {
                console.warn("Session expired while editing entry.");
            } else {
                console.error(e);
            }
        }
    }

    async function submitAdd() {
        let valArr = getValues();

        for (let i = 0; i < valArr.length; i++) {
            if (valArr[i] === "") continue;
            console.log(valArr);
            let match;
            switch (tableCols[i].type) {
                case "text":
                    if (elements[0].tr.props.children[0][i].props.children === tableKey) {
                        for (let j = 0; j < elements.length; j++) {
                            console.log(elements[j]);
                            if (elements[j].tr.props.children[0][i].props.children === valArr[i]) {
                                console.warn("BAD KEY");
                                return;
                            }
                        }
                    }
                    break;
                case "number":
                    match = valArr[i].match(/([0-9]*)/g);
                    if (!match || !match.includes(valArr[i])) {
                        console.warn("Not a number!");
                        return;
                    }
                    break;
                case "URL":
                    match = valArr[i].match(/https?:\/\/www\.\S*\.\w*/g);
                    if (!match || !match.includes(valArr[i])) {
                        console.warn("Not a URL!");
                        return;
                    }
                    break;
                case "boolean":
                    match = valArr[i].match(/(true|false)/gi);
                    if (!match || !match.includes(valArr[i])) {
                        console.warn("Not a Boolean!");
                        return;
                    }
                    break;
            }
        }
        try {
            await sheetsAPI.editSheet(props.sheetURL, valArr, props.detailEntry + 1);
            await props.appendCol();
            props.exit();
        } catch (e) {
            if (e.unauthorized) {
                console.warn("Session expired while adding entry.");
            } else {
                console.error(e);
            }
        }
    }

    // Display a JSX table containing the first row of the table (column headers),
    // and the row corresponding to the current index.
    // Provide controls for changing the current row index.
    if (props.detailEntry >= 0 && props.table === props.detailTable) {
        if (props.detailEntry < elements.length) {
            if (!isEditing) {
                return (
                    <div>
                        <table style={borderStyle}>
                            <tbody>
                                <tr>
                                    <th style={borderStyle}>{props.name}</th>
                                </tr>
                                {elements[0].tr}
                                {elements[props.detailEntry].tr}
                            </tbody>
                        </table>
                        {allowedActions.includes("edit") && elements[props.detailEntry].canEdit ? (
                            <Button
                                onClick={() => {
                                    setEditing((e) => !e);
                                }}
                            >
                                Edit
                            </Button>
                        ) : (
                            ""
                        )}
                        <Button onClick={props.exit}>Exit</Button>
                    </div>
                );
            } else {
                let inputTds = elements[props.detailEntry].tr.props.children[0].map(
                    (tdElem, index) => {
                        if (
                            props.editableCols &&
                            props.editableCols.includes(
                                elements[0].tr.props.children[0][index].props.children
                            )
                        )
                            return (
                                <td
                                    key={index}
                                    style={{
                                        border: "1px solid black",
                                        borderCollapse: "collapse",
                                    }}
                                >
                                    <TextField
                                        defaultValue={tdElem.props.children}
                                        onChange={(event) => {
                                            setInputs({
                                                ...inputs,
                                                [tdElem.key]: event.target.value,
                                            });
                                        }}
                                    ></TextField>
                                </td>
                            );
                        else
                            return (
                                <td
                                    key={index}
                                    style={{
                                        border: "1px solid black",
                                        borderCollapse: "collapse",
                                    }}
                                >
                                    {tdElem.props.children}
                                </td>
                            );
                    }
                );
                return (
                    <div>
                        <table style={borderStyle}>
                            <tbody>
                                <tr>
                                    <th style={borderStyle}>Add Record</th>
                                </tr>
                                {elements[0].tr}
                                <tr>{inputTds}</tr>
                            </tbody>
                        </table>
                        <Button
                            onClick={() => {
                                submitEdit();
                            }}
                        >
                            Submit
                        </Button>
                        <Button
                            onClick={() => {
                                setEditing((e) => !e);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                );
            }
        } else {
            let inputTds = elements[0].tr.props.children[0].map((tdElem, index) => {
                return (
                    <td
                        key={index}
                        style={{ border: "1px solid black", borderCollapse: "collapse" }}
                    >
                        <TextField
                            defaultValue={""}
                            onChange={(event) => {
                                setInputs({
                                    ...inputs,
                                    [tdElem.key]: event.target.value,
                                });
                            }}
                        ></TextField>
                    </td>
                );
            });

            return (
                <div>
                    <table style={borderStyle}>
                        <tbody>
                            <tr>
                                <th style={borderStyle}>Add Record</th>
                            </tr>
                            {elements[0].tr}
                            <tr>{inputTds}</tr>
                        </tbody>
                    </table>
                    <Button
                        onClick={() => {
                            submitAdd();
                        }}
                    >
                        Submit
                    </Button>
                    <Button onClick={props.exit}>Cancel</Button>
                </div>
            );
        }
    }
}
