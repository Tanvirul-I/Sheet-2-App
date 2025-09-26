/**
 * Creates a new View based on the request. Throws 400 error if View object creation fails
 * @param { Object } req
 * @param { Object } res
 * @returns Created View or error 500 depending on success
 */
const View = require("../schemas/view-schema");

createView = async (req, res) => {
	try {
		const body = req.body;

		console.log("createView body: " + JSON.stringify(body));

		if (!body) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		const view = new View(body);
		if (!view) {
			return res.status(400).json({ success: false, error: err });
		}

		console.log("View: " + view.toString());

		const savedView = await view
			.save()
			.then(() => {
				return res.status(201).json({
					success: true,
					view: view,
				});
			})
			.catch((err) => {
				return res.status(500).json({
					success: false,
					error: err,
				});
			});

		console.log("Created View: " + savedView);
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			success: false,
			error: err,
		});
	}
};

/**
 * Finds DataSource based on id. Updates it if parameters exist. Throws 404 if DataSource with id does not exist.
 * @param { Object } req
 * @param { Object } res
 * @returns updated DataSource or throws err depending on success
 */
updateView = async (req, res) => {
	try {
		const body = req.body;

		console.log("updateView body: " + JSON.stringify(body));

		if (!body) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		let view = await View.findOne({ _id: body._id });

		if (!view) {
			return res.status(404).json({ success: false, error: err });
		}

		console.log("View: " + view.toString());

		if (body.name !== undefined) view.name = body.name;
		if (body.table !== undefined) view.table = body.table;
		if (body.columns !== undefined) view.columns = body.columns;
		if (body.type !== undefined) view.type = body.type;
		if (body.allowedActions !== undefined)
			view.allowedActions = body.allowedActions;
		if (body.roles !== undefined) view.roles = body.roles;
		if (body.filter !== undefined) view.filter = body.filter;
		if (body.userFilter !== undefined) view.userFilter = body.userFilter;
		if (body.editFilter !== undefined) view.editFilter = body.editFilter;
		if (body.editableCols !== undefined) view.editableCols = body.editableCols;

		const savedView = await view
			.save()
			.then(() => {
				return res.status(201).json({
					success: true,
					view: view,
				});
			})
			.catch((err) => {
				return res.status(500).json({
					success: false,
					error: err,
				});
			});

		console.log("Updated View: " + savedView);
	} catch (err) {
		return res.status(500).json({
			success: false,
			error: err,
		});
	}
};

/**
 * Finds View based on id. Throws 404 if DataSource with id does not exist.
 * @param { Object } req
 * @param { Object } res
 * @returns View or throws err depending on success
 */
getViewById = async (req, res) => {
	try {
		const id = req.query.id;

		if (!id) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		console.log("getting view with id " + id);

		const view = await View.findOne({ _id: id });

		// added Error checking if no View found.
		if (!view) {
			return res.status(404).json({ error: "no view with this id" });
		}

		return res.status(200).json({
			success: true,
			view: view,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
};

/**
 * Finds View based on id and deletes it. Throws 404 if View with id does not exist.
 * @param { Object } req
 * @param { Object } res
 * @returns success or error 500 based on whether View was deleted.
 */
deleteView = async (req, res) => {
	try {
		const id = req.query.id;

		if (!id) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		console.log("deleting view with id " + id);

		const view = await View.findOneAndDelete({ _id: id });

		if (!view) {
			return res.status(404).json({ error: "no view with this id" });
		}

		return res.status(200).json({
			success: true,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
};

module.exports = {
	createView,
	updateView,
	getViewById,
	deleteView,
};
