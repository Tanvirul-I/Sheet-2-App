import Cell from './Cell';

class Record {
	/**
	 * boilerplate constructor
	 * @param { string } key
	 * @param { Cell<Array> } cells
	 */
	constructor(key, cells) {
		this._key = key;
		this._cells = cells;
	}

	/**
	 * boilerplate getter
	 * @returns cells
	 */
	getCells = () => {
		return this._cells;
	};

	/**
	 * boilerplate getter
	 * @returns key
	 */
	getKey = () => {
		return this._key;
	};

	/**
	 * Boilerplate setter
	 * @param { Record } record value to be updated
	 * @returns boolean depending on success
	 */
	updateValue = (record) => {
		if (this._cells.length != record.getCells().length) return false;
		for (let i = 1; i < record.getCells().length; i++) {
			this._cells[i].updateCell(record.getCells()[i]);
		}
		return true;
	};

	/**
	 * updates the cell value of the index to empty double quotes
	 * @param { Cell } cell
	 * @returns { boolean } true if deletion succesful
	 */
	deleteValue = (cell) => {
		let index = this.values.indexOf(cell);
		if (index !== -1) this._cells[index].updateCell(cell.getCellValue(), cell.getCellType());
		return index !== -1;
	};
}

export default Record;
