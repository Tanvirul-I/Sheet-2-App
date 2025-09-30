import { TYPES } from "./Enums";

class Cell {
  /**
   * constructor for cell class. sets cell value and type of value in cell.
   * @param { string } _cellValue
   * @param { TYPES } _type
   */
  constructor(cellValue, type = TYPES.Text) {
    this._cellValue = cellValue;
    this._type = type;
  }

  /**
   * boilerplate getter
   * @returns this._cellValue
   */
  getCellValue = () => {
    return this._cellValue;
  };

  /**
   * boilerplate getter
   * @returns the type of the cell
   */
  getCellType = () => {
    return this._type;
  };

  /**
   * boilerplate setter
   * @param { Cell } cell
   */
  updateCell = (cell) => {
    this._cellValue = cell.getCellValue();
    this._type = cell.getCellType();
  };
}

export default Cell;
