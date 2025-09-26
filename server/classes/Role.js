import { PERMISSIONS } from "./Enums";

class Role {
	/**
	 * boilerplate constructor
	 * @param { string } roleName
	 * @param { PERMISSIONS<Array> } permissions
	 */
	constructor(roleName, permissions = [PERMISSIONS.View]) {
		this._roleName = roleName;
		this._permissions = permissions;
	}

	/**
	 * boilerplate getter
	 * @returns rolename
	 */
	getRoleName = () => {
		return this._roleName;
	};

	/**
	 * boilerplate setter
	 * @param { string } roleName
	 */
	setRoleName = (roleName) => {
		this._roleName = roleName;
	};

	/**
	 * boilerplate getter
	 * @returns permissions
	 */
	getPermissions = () => {
		return this._permissions;
	};

	/**
	 * setter for permissions (adds if perms doesnt exist on Role)
	 * @param { PERMISSIONS<Array> } permissions
	 */
	addPermissions = (permissions) => {
		for (let i = 0; i < permissions.length; i++)
			if (!this._permissions.includes(permissions[i]))
				this._permissions.push(permissions[i]);
	};

	/**
	 * Takeaway permissions from role
	 * @param { PERMISSIONS<Array> } permissions
	 */
	removePermissions = (permissions) => {
		for (let i = 0; i < permissions.length; i++)
			if (this._permissions.includes(permissions[i]))
				this._permissions.splice(permissions[i], 1);
	};
}

export default Role;
