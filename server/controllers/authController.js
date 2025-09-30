/**
 *
 * Back-end API that handles the user authentication requests.
 *
 * All info for user is in the format:
 * {
 *		"email": "email@domain.com",
 *		"family_name": "last_name",
 *		"given_name": "first_name",
 *		"hd": "domain.com",
 *		"id": "id",
 *		"locale": "en",
 *		"name": "Full Name",
 *		"picture": "google profile picture url"
 * }
 */
const sheetsAPI = require('../google/sheets');
const jwt = require('jsonwebtoken');
const { OAuthObjectStore, OAuthObject } = require('../classes/googleOAuthHandler');
const OAuth = require('../google/oauth');

/**
 * Logs user in using the Google Code passed in
 *
 * @async
 * @param { Object } req The Google credentials code
 * @param { Object } res
 * @returns The status code and message of the login request
 */
login = async (req, res) => {
	try {
		const code = req.query.code;

		// Handling invalid client input
		if (!code) {
			return res.status(400).json({ errorMessage: 'Please enter all required fields.' });
		}

		let client = new OAuthObject();
		let loginSuccess = await client.initialize(code);

		if (!loginSuccess.success)
			return res.status(200).json({
				success: false,
				message: 'Failed to login'
			});

		let info = client.getInfo();

		//Client doesn't already exist in the OAuth objects store
		if (!OAuthObjectStore.getClient(info.email)) {
			OAuthObjectStore.addClient(client);
		} else {
			console.log('Client exists');
		}

		const token = jwt.sign(
			info,
			process.env.JWT /*,
			{
				expiresIn: "1h",
			}*/
		);

		return res.status(200).json({
			success: true,
			token,
			data: info
		});
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
};

// Remove user info from class
/**
 * Logs current user out and ends the session.
 *
 * @async
 * @param { Object } req token
 * @param { Object } res
 * @returns {void}
 */
logout = async (req, res) => {
	try {
		const token = req.query.token;
		const decodedToken = jwt.verify(token, process.env.JWT);
		OAuthObjectStore.removeClient(decodedToken.email);

		res.status(200).json({
			success: true,
			token,
			data: info.data
		});
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
};

/**
 * Uses JWT to return the given user's information.
 *
 * @async
 * @param { Object } req token
 * @param { Object } res
 * @returns {number} Returns the status code of the request.
 */
user = async (req, res) => {
	try {
		const token = req.query.token;

		if (!token) {
			return res.status(400).json({ errorMessage: 'Please enter all required fields.' });
		}

		const decodedToken = jwt.verify(token, process.env.JWT);
		//let client = OAuthObjectStore.getClient(decodedToken.email);

		/*if (!client) {
			return res.status(200).json({
				success: false,
			});
		}*/

		return res.status(200).json({
			success: true,
			data: decodedToken,
			token: token
		});
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
};

/**
 * Decodes and verifies the token passed
 *
 * @async
 * @param {string} token
 * @returns {boolean} True if the token passed the verification, false otherwise.
 */
verifyToken = async (token) => {
	try {
		const decodedToken = jwt.verify(token, process.env.JWT);
		return decodedToken;
	} catch (err) {
		console.error(err);
		return false;
	}
};

module.exports = {
	login,
	logout,
	user,
	verifyToken
};
