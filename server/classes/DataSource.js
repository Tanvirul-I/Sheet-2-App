import { TYPES } from "./Enums";
import Column from "./Column";
import Cell from "./Cell";

class DataSource {
    /**
     * constructor takes data and converts it to key column object and an array column objects. The other parameters are set to instance variable name and url.
     * IMPORTANT NOTE: DataSource Constructor assumes the first column to be the Key Column (implementation is likely to change based on teammate response.)
     * constructor for setting instance variables.
     * NOTE SheetIndex omitted due to Gid being included at the end of URL
     * @param { string } name
     * @param { string } url
     * @param { string<Array><Array> } data (under current conditions, the data is assumed to be in 'COL' orientation.)
     */
    constructor(name, url, data) {
        this._name = name;
        this._url = url;
        let keyCell = [];
        for (i = 1; i < data[0].length; i++) {
            keyCell.push(new Cell(data[0][i]));
        }
        this._key = new Column(data[0][0], undefined, false, this, TYPES.Text, cells); // still unclear how label and initialValue is supposed to be used -- FIX IMMEDIATELY

        this._columns = [];
        for (let i = 1; i < data.length; i++) {
            let cells = [];
            let type = "";
            for (let j = 1; j < data[i].length; j++) {
                type = this._determineType(data[i][j]);
                cells.push(new Cell(data[i][j], type));
            }
            this._columns.push(new Column(data[i][0], undefined, false, this, type, cells)); // still unclear how label and initialValue is supposed to be used -- FIX IMMEDIATELY
        }
    }

    /**
     * boilerplate getter
     * @returns the name of the DataSource
     */
    getName = () => {
        return this._name;
    };

    /**
     * boilerplate setter
     * @param { string } name
     */
    setName = (name) => {
        this._name = name;
    };

    /**
     * boilerplate getter
     * @returns the url of the DataSource
     */
    getURL = () => {
        return this._url;
    };

    /**
     * boilerplate getter
     * @returns the key column of the DataSource
     */
    getKey = () => {
        return this._key;
    };

    /**
     * boilerplate getter
     * @returns the columns in the DataSource
     */
    getColumns = () => {
        return this._columns;
    };

    /**
     * Private Helper method to help constructor
     * type checker for cell creation
     * @param { string } sampleValue
     * @returns the type of value contained inside string
     */
    _determineType = (sampleValue) => {
        if (sampleValue.includes("http")) return TYPES.URL;
        if (sampleValue === "TRUE" || sampleValue === "FALSE") return TYPES.Boolean;
        if (/^\d+$/.test(sampleValue)) return TYPES.Number;
        else return TYPES.Text;
    };
}

export default DataSource;
