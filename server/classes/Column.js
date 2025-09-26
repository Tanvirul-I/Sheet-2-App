import { TYPES } from "./Enums";
import Cell from "./Cell";
import DataSource from "./DataSource";

class Column {
	/**
	 * constructor for all given values and some default values. Constructor produces different object depending on values.
	 * @param { string } name
	 * @param { string } initialValue
	 * @param { boolean } label
	 * @param { DataSource } reference
	 * @param { TYPES } type
	 * @param { Cell<Array> } cells
	 */
	constructor(
		name,
		initialValue = "",
		label,
		reference,
		type,
		cells
	) {
		// Default type set to TEXT
		this._name = name;
		this._initialValue = initialValue;
		this._label = label;
		this._reference = reference;
		this._type = type;
		this._cells = cells;
	}

	/**
	 * boilerplate getter
	 * @returns the name of the column
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
	 * @returns the initial value of the column
	 */
	getInitialValue = () => {
		return this._initialValue;
	};

	/**
	 * boilerplate setter
	 * @param { string } initial value
	 */
	setInitialValue = (initialValue) => {
		this._initialValue = initialValue;
	};

	/**
	 * boilerplate getter
	 * @returns the label of the column
	 */
	getLabel = () => {
		return this._label;
	};

	/**
	 * boilerplate setter
	 * @param { boolean } label
	 */
	setLabel = (label) => {
		this._label = label;
	};

	/**
	 * boilerplate getter
	 * @returns the DataSource this Column refers to.
	 */
	getReference = () => {
		return this._reference;
	};

	/**
	 * boilerplate setter
	 * @param { DataSource } reference
	 */
	setReference = (reference) => {
		this._reference = reference;
	};

	/**
	 * boilerplate getter
	 * @returns the enum
	 */
	getType = () => {
		return this._type;
	};

	/**
	 * boilerplate setter
	 * @param { TYPES } type
	 */
	setType = (type) => {
		this._type = type;
	};

	/**
	 * boilerplate getter
	 * @returns the cells array in the column
	 */
	getCells = () => {
		return this._cells;
	};
}

export default Column;
