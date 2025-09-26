import Role from "./Role";
import { PERMISSIONS } from "./Enums";
import User from "./User";
import DataSource from "./DataSource";
import View from "./View";

class Apps {
	/**
	 * constructor creates users using the roleMembership sheet.
	 * Apps does not assign permissions to Roles
	 * Creation of roles and users is ok but views should be able to edit permissions of the roles
	 * @param { string } name
	 * @param { string } creator
	 * @param { string<Array><Array> } roleMembership constructor assumes roleMembership comes in as a 2D string array. Realistically, it might come in as .values
	 * @param { boolean } published
	 * @param { string<Array><Array><Array> } sheets  unclear what kind of data structure is going to come through from database or JSON. for now, it can be assumed to be 3D string array.
	 * @param { string<Array> } sheetsNames array of strings which depicts the names of sheets. High probability it is going to be part of the "sheets" parameter.
	 * @param { string<Array> } urls        array of string depicting the urls of the sheets coming through
	 */
	constructor(
		name,
		creator,
		roleMembership,
		published = false,
		sheets,
		sheetsNames,
		urls
	) {
		this._name = name;
		this._creator = creator;
		this._published = published;

		this._roles = [];
		this._users = [];
		for (let i = 0; i < roleMembership.length; i++) {
			// assumes roleMembership is a 2D array containing emails of users under each role
			this._roles.push(new Role(roleMembership[i][0])); // EACH COLUMN IS A NEW ROLE.
			for (let j = 1; j < roleMembership[i].length; j++) {
				if (this._checkUserExistence(roleMembership[i][j]) === -1)
					this._users.push(new User(roleMembership[i][j], [this._roles[i]]));
				else this._users[i].addRole(this._roles[i]);
			}
		}

		this._dataSources = [];
		for (let i = 0; i < sheets.length; i++) {
			// for loop assumes that urls, sheetsnames and sheets all have same length (length being the number of sheets coming through)
			this._dataSources.push(
				new DataSource(sheetsNames[i], urls[i], sheets[i])
			);
		}

		this._views = [];
		for (let i = 0; i < this._dataSources.length; i++) {
			this._views.push(
				new View(this._dataSources[i].getName, this._dataSources[i], undefined)
			); // unclear how the roles and Permissions for views would be managed from front-end (late-phase coding. part of Data Freshness and Caching)
		}
	}

	/**
	 * Private Helper Method
	 * @param { string } userEmail
	 * @returns index if user Object with email exists. else returns -1.
	 */
	_checkUserExistence = (userEmail) => {
		for (let i = 0; i < this._users.length; i++) {
			if (this._users[i].getEmail() === userEmail) return i;
		}
		return -1;
	};

	/**
	 * publishes app
	 */
	publishApp = () => {
		this._published = true;
	};

	/**
	 * unpublishes app
	 */
	publishApp = () => {
		this._published = false;
	};

	/**
	 * sets the current app to null essentially deleting data in it.
	 * may have to set all instance variables to null. still unclear due to lack of javascript object testing being unimplemented in the rest of the program.
	 */
	deleteApp = () => {
		this.Apps = null;
	};
}

export default Apps;
