import { ALLOWED_ACTIONS } from "./Enums";
import DataSource from "./DataSource";
import Record from "./Record";
import Role from "./Role";
import Table from "./Table";
import Detail from "./Detail";
import Column from "./Column";

class View {
  /**
   *
   * @param { string } name
   * @param { DataSource } table
   * @param { Role<Array> } roles
   * @param { ALLOWED_ACTIONS<Array> } allowedActions
   */
  constructor(name, table, roles, allowedActions = [ALLOWED_ACTIONS.Add]) {
    this._name = name;
    this._table = table;
    this._columns = this._table.getColumns();
    this._roles = roles;
    this._allowedActions = allowedActions;
    if (this._allowedActions.includes(ALLOWED_ACTIONS.Edit))
      this._viewType = new Detail();
    else this._viewType = new Table();

    this._records = [];
    for (let i = 0; i < this._columns[0].getCells().length; i++) {
      // records assumes that each column has the same number of cells. It also assumes that the key column also has the same number of cells.
      let cells = [];
      for (let j = 0; j < this._columns.length; j++) {
        cells.push(this._columns[j].getCells()[i]);
      }
      this._records.push(new Record(this._table.getKey().getCells()[i], cells));
    }
  }

  /**
   * boilerplate getter
   * @returns name
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
   * @returns table
   */
  getTable = () => {
    return this._table;
  };

  displayReferences = () => {};

  /**
   * Adds the recordInfo to the end of the array.
   * @param { Record } recordInfo
   */
  addingRecord = (recordInfo) => {
    this._records.push(recordInfo);
  };

  /**
   * This method checks the key of the recordInfo then replaces that row with recordInfo
   * @param { Record } recordInfo  the Record that is going to replace something else on the array.
   */
  editRecord = (recordInfo) => {
    for (let i = 0; i < this.records.length; i++) {
      if (
        this._records[i].values[0].getCellValue() === // if key is equal
        recordInfo.values[0].getCellValue()
      )
        this._records[i].updateValue(recordInfo);
    }
  };
}

export default View;
