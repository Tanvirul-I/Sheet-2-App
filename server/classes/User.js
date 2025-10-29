import Role from "./Role";

class User {
    /**
     * boilerplate constructor
     * @param { string } email
     * @param { Role<Array> } roles
     */
    constructor(email, roles) {
        this._email = email;
        this._roles = roles;
    }

    /**
     * boilerplate getter
     * @returns email
     */
    getEmail = () => {
        return this._email;
    };

    /**
     * boilerplate getter
     * @returns roles
     */
    getRoles = () => {
        return this._roles;
    };

    addRole = (role) => {
        if (!this._roles.includes(role)) this._roles.push(role);
    };
}

export default User;
