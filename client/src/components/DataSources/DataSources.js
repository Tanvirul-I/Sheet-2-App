/**
 *
 * Handles Datasource inputs from user.
 * A lot of the button/formatting code taken from
 * https://mui.com/material-ui/react-menu/
 * https://mui.com/material-ui/react-checkbox/
 * https://mui.com/material-ui/react-text-field/
 * https://mui.com/material-ui/react-select/
 *
 */

import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Checkbox,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import sheetsAPI from "../../api/sheets";
import appAPI from "../../api/app";
import dataAPI from "../../api/data";

export default function DataField(props) {
  const [name, setName] = useState("");
  const [sheetURL, setSheetURL] = useState("");
  const [key, setKey] = useState("");
  const [gid, setGid] = useState("");
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetInfo, setSheetInfo] = useState([]); // Used to store the column info for the spreadsheet.
  const [error, setError] = useState("");
  const [types, setTypes] = useState({});
  const [boolType, setBool] = useState("boolean"); // This is used as a temporary fix for the types selection box not updating properly.

  let labelVals = {};
  let initVals = {};
  let references = {};

  /**
   * Gets the information contained in the sheet using sheet URL. The Sheet URL is stored using state.
   *
   * @async
   * @returns { void }
   */
  const getSheet = async () => {
    try {
      let response = await sheetsAPI.sheetinfo(sheetURL);
      if (response.data.success) {
        setSheetInfo(response.data.sheet);
        setGid(response.data.gid);
        setSpreadsheetId(response.data.sheetId);
        setError("");
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

  /**
   * Generating the components for each of the entry fields for
   * the user to select options for the datasource and
   * updates appropriate state variable for each field.
   */
  let userInputColumns = sheetInfo.map((sheet, index) => {
    const label = { inputProps: { "aria-label": "Checkbox demo" } };

    // Sheet variable is an array of all the values in the
    // column, index 0 is the column header.
    labelVals[sheet[0]] = false;
    let typeVal = types[sheet[0]] ? types[sheet[0]] : "";
    console.log(types);
    return (
      <tr className="ds-row" key={index}>
        <td className="ds-cell label">{sheet[0]}</td>
        <td>
          <Checkbox {...label} onChange={() => setKey(sheet[0])} />
        </td>
        <td className="ds-cell">
          <TextField
            id="outlined-basic"
            label="Initial Value"
            variant="outlined"
            onChange={(event) => {
              initVals[sheet[0]] = event.target.value;
            }}
          />
        </td>
        <td className="ds-cell">
          <Checkbox
            {...label}
            onChange={() => {
              labelVals[sheet[0]]
                ? (labelVals[sheet[0]] = false)
                : (labelVals[sheet[0]] = true);
            }}
          />
        </td>
        <td className="ds-cell">
          <TextField
            id="outlined-basic"
            label="Reference"
            variant="outlined"
            onChange={(event) => {
              references[sheet[0]] = event.target.value;
            }}
          />
        </td>
        <td className="ds-cell type">
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={types[sheet[0]] ? types[sheet[0]] : ""}
              label="Type"
              onChange={(event) => {
                let newTypes = types;
                newTypes[sheet[0]] = event.target.value;
                setTypes(newTypes);
                setBool(event.target.value);
              }}
            >
              <MenuItem value={"boolean"}>Boolean</MenuItem>
              <MenuItem value={"number"}>Number</MenuItem>
              <MenuItem value={"text"}>Text</MenuItem>
              <MenuItem value={"URL"}>URL</MenuItem>
            </Select>
          </FormControl>
        </td>
      </tr>
    );
  });

  const submitData = async () => {
    // Creating the column array to be sent to the backend,
    // storing information pertaining to each column.
    let columns = sheetInfo.map((column) => {
      let returnVal = {
        name: column[0],
        label: labelVals[column[0]],
        type: types[column[0]],
      };
      return returnVal;
    });

    // Handling invalid or missing client input
    for (let column of columns) {
      if (!column.type) {
        setError("Please fill in all required fields");
        return;
      }
    }

    if (!name || !sheetURL || !gid || !key || !columns) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      let response = await dataAPI.createDataSource({
        name: name,
        url: sheetURL,
        spreadsheetId: spreadsheetId,
        gid: gid,
        key: key,
        columns: columns,
        published: false,
      });
      if (response.data.success) {
        if (!props.app.dataSources) {
          props.app.dataSources = [response.data.ds._id];
        } else {
          props.app.dataSources.push(response.data.ds._id);
        }
      }
      // To be changed ***
      // Should end up being done on the serverside immediately after data source creation, to be updated.
      // Shouldn't need the user to send another erquest
      await appAPI.updateApp({
        _id: props.app._id,
        dataSources: props.app.dataSources,
      });
    } catch (e) {
      console.log(e);
      if (e.unauthorized) {
        setError("Your session has expired. Please log in again.");
      } else if (e.data && e.data.error && e.data.error._message) {
        setError("Error from server for request:\n" + e.data.error._message);
      } else if (e.data && e.data.errorMessage) {
        setError("Error from server for request:\n" + e.data.errorMessage);
      } else if (e.data && e.data.error) {
        setError("Error from server for request:\n" + e.data.error);
      } else {
        setError("An unexpected error occurred while contacting the server.");
      }
    }
  };

  return (
    <div id="add-data-source-container">
      <div id="data-input-fields-container">
        <TextField
          className="data-input-fields"
          label="Name"
          variant="outlined"
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
        <TextField
          className="data-input-fields"
          label="Spreadsheet URL"
          variant="outlined"
          onChange={(event) => {
            setSheetURL(event.target.value);
          }}
        />
        <Button
          className="data-input-fields"
          variant="contained"
          onClick={getSheet}
        >
          Read Sheet
        </Button>
      </div>
      <div id="create-datasource-table">
        <table>
          <tbody>
            <tr className="ds-row ds-header">
              <td className="ds-cell ds-header"></td>
              <td className="ds-cell ds-header">Key</td>
              <td className="ds-cell ds-header">Initial value</td>
              <td className="ds-cell ds-header">Label</td>
              <td className="ds-cell ds-header">Reference</td>
              <td className="ds-cell ds-header">Type</td>
            </tr>
            {userInputColumns}
          </tbody>
        </table>
      </div>
      <Button className="ds button" variant="contained" onClick={submitData}>
        Submit
      </Button>
      {error ? <Typography className="error-message">{error}</Typography> : ""}
    </div>
  );
}
