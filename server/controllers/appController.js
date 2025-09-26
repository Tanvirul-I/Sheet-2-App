const { getSheetByURL } = require("../misc/sheetsHelper");
const App = require("../schemas/app-schema");

/**
 * Retrieves all the apps that exist under the specified user.
 * @param { Object } req user
 * @param { Object } res
 * @returns list of apps if successful, otherwise throws error.
 */
getApps = async (req, res) => {
	try {
		console.log("Retrieving apps: ");

		// List of apps where the user is the creator
		const apps = await App.find();

		// Return the list of apps and a OK status code
		return res.status(200).json({
			success: true,
			apps: apps,
		});
	} catch (err) {
		// Returning server error status code
		console.error(err);
		res.status(500).send();
	}
};

/**
 * Creates a new app while performing checks on the data being passed..
 * @param { Object } req
 * @param { Object } res
 * @returns app or throws err depending on success
 */
createApp = async (req, res) => {
	try {
		const body = req.body;

		console.log("createApp body: " + JSON.stringify(body));
		console.log(body);
		if (!body) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		// Verifying creator is in the global developer list. If not, return error
		// let isGlobalDev = inGlobalDevList(body.creator);
		// console.log("Verifying creator: " + body.creator);

		// if (!isGlobalDev) {
		// 	// return permission error
		// 	return res
		// 		.status(400)
		// 		.json({ errorMessage: "Not authorized to create app." });
		// } else {
		// 	// continue with app creation
		// 	console.log("Creator is a global dev: " + isGlobalDev);
		// }

		const app = new App(body);
		if (!app) {
			return res.status(400).json({ success: false, error: err });
		}

		console.log("App: " + app.toString());

		const savedApp = await app
			.save()
			.then(() => {
				return res.status(201).json({
					success: true,
					app: app,
				});
			})
			.catch((err) => {
				return res.status(500).json({
					success: false,
					error: err,
				});
			});

		console.log("Created App: " + savedApp);
	} catch (err) {
		return res.status(500).json({
			success: false,
			error: err,
		});
	}
};

/**
 * Finds an app based on the id that is passed in. Then updates the app if it exists. Otherwise throws 404 error
 * @param { Object } req
 * @param { Object } res
 * @returns apps or throws err depending on success
 */
updateApp = async (req, res) => {
	try {
		const body = req.body;

		console.log("updateApp body: " + JSON.stringify(body));

		if (!body) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		let app = await App.findOne({ _id: body._id });

		if (!app) {
			return res.status(404).json({ success: false, error: err });
		}

		console.log("App: " + app.toString());

		if (body.name !== undefined) app.name = body.name; // if everything else does not throw error, starts updating app here. only updates if paramater exists.
		if (body.published !== undefined) app.published = body.published;
		if (body.roleSheet !== undefined) app.roleSheet = body.roleSheet;
		if (body.roles !== undefined) app.roles = body.roles;
		if (body.creator !== undefined) app.creator = body.creator;
		if (body.dataSources !== undefined) app.dataSources = body.dataSources;
		if (body.view !== undefined) app.view = body.view;

		const savedApp = await app
			.save()
			.then(() => {
				return res.status(201).json({
					success: true,
					app: app,
				});
			})
			.catch((err) => {
				return res.status(500).json({
					success: false,
					error: err,
				});
			});

		console.log("Updated App: " + savedApp);
	} catch (err) {
		return res.status(500).json({
			success: false,
			error: err,
		});
	}
};

/**
 * Finds an app based on the id that is passed in. Otherwise throws 404 error
 * @param { Object } req
 * @param { Object } res
 * @returns apps or throws err depending on success
 */
getAppById = async (req, res) => {
	try {
		const id = req.query.id;

		if (!id) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		console.log("getting app with id " + id);

		const app = await App.findOne({ _id: id });

		// Added error checking if app was not found using id.
		if (!app) {
			return res.status(404).json({ success: false, error: err });
		}

		return res.status(200).json({
			success: true,
			app: app,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
};

/**
 * Finds an app based on the passed id and deletes it. Otherwise throws 404 error
 * @param { Object } req
 * @param { Object } res
 * @returns success or throws error
 */
deleteApp = async (req, res) => {
	try {
		const id = req.query.id;

		if (!id) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		console.log("deleting app with id " + id);

		const app = await App.findOneAndDelete({ _id: id });

		if (!app) {
			return res.status(404).json({ error: "no app with this id" });
		}

		return res.status(200).json({
			success: true,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
};

/**
 * Finds an app based on the id that is passed in. Then updates the app roles if the app exists. Otherwise throws 404 error
 * @param { Object } req
 * @param { Object } res
 * @returns app or throws err depending on success
 */
updateRoles = async (req, res) => {
	try {
		const body = req.body;

		console.log("updateApp body: " + JSON.stringify(body));

		if (!body) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		let app = await App.findOne({ _id: body._id });

		if (!app) {
			return res.status(404).json({ success: false, error: err });
		}

		console.log("App: " + app.toString());

		let { sheetInfo } = await getSheetByURL(app.roleSheet, app.creator);

		console.log(sheetInfo);

		let newRoles = sheetInfo.map((column) => {
			let returnVal = {
				name: column[0],
				members: column.slice(1),
			};
			return returnVal;
		});

		if (newRoles !== undefined) app.roles = newRoles;

		const updatedApp = await App.updateOne(
			{ _id: body._id },
			{ roles: newRoles }
		)
			.then(() => {
				return res.status(201).json({
					success: true,
					app: app,
				});
			})
			.catch((err) => {
				console.log(err);
			});

		console.log("Updated App: " + app);
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			success: false,
			error: err,
		});
	}
};

module.exports = {
	getApps,
	createApp,
	updateApp,
	getAppById,
	deleteApp,
	updateRoles,
};
