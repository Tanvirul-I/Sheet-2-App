/**
 *
 * Back-end API that handles App, DataSource and View CRUD requests.
 *
 */

const DataSource = require("../schemas/dataSource-schema");

const { getSheetByURL } = require("../misc/sheetsHelper");
const { verifyToken } = require("../controllers/authController");

/**
 * Creates a new DataSource based on the request. Throws 400 error if DataSource object creation faile
 * @param { Object } req
 * @param { Object } res
 * @returns Created Datasource or error 500 depending on success
 */
createDataSource = async (req, res) => {
	try {
		const body = req.body;

		console.log("createDataSource body: " + JSON.stringify(body));

		if (!body) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		const ds = new DataSource(body);
		if (!DataSource) {
			return res.status(400).json({ success: false, error: err });
		}

		console.log("DS: " + ds.toString());

		const savedDS = await ds
			.save()
			.then(() => {
				return res.status(201).json({
					success: true,
					ds: ds,
				});
			})
			.catch((err) => {
				return res.status(500).json({
					success: false,
					error: err,
				});
			});

		console.log("Created DS: " + savedDS);
	} catch (err) {
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
updateDataSource = async (req, res) => {
	try {
		const body = req.body;

		console.log("updateDataSource body: " + JSON.stringify(body));

		if (!body) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		let ds = await DataSource.findOne({ _id: body._id });

		if (!ds) {
			return res.status(404).json({ success: false, error: err });
		}

		console.log("DataSource: " + ds.toString());

		if (body.name !== undefined) ds.name = body.name;
		if (body.published !== undefined) ds.published = body.published; // NOTE: SIMILAR TO UPDATE APP, published will not update if its updated to false.
		if (body.url !== undefined) ds.url = body.url;
		if (body.gid !== undefined) ds.gid = body.gid;
		if (body.key !== undefined) ds.key = body.key;
		if (body.columns !== undefined) ds.columns = body.columns;

		const savedDs = await ds
			.save()
			.then(() => {
				return res.status(201).json({
					success: true,
					ds: ds,
				});
			})
			.catch((err) => {
				return res.status(500).json({
					success: false,
					error: err,
				});
			});

		console.log("Updated DS: " + savedDs);
	} catch (err) {
		return res.status(500).json({
			success: false,
			error: err,
		});
	}
};

/**
 * Finds DataSource based on id. Throws 404 if DataSource with id does not exist.
 * @param { Object } req
 * @param { Object } res
 * @returns DataSource and data (assumed to be 2D Array) inside sheets or throws err depending on success
 */
getDataSourceById = async (req, res) => {
	try {
		//ID is from ID in the database
		const id = req.query.id;
		const token = req.query.token;

		if (!id || !token) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		const ds = await DataSource.findOne({ _id: id });

		// added Error Checking if no datasource found.
		if (!ds) {
			return res.status(404).json({ error: "no ds with this id" });
		}

		let clientInfo = await verifyToken(token);
		let { sheetInfo } = await getSheetByURL(ds.url, clientInfo.email);

		return res.status(200).json({
			success: true,
			ds: ds,
			data: sheetInfo,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
};

/**
 * Finds DataSource based on id and deletes it. Throws 404 if DataSource with id does not exist.
 * @param { Object } req
 * @param { Object } res
 * @returns success or error 500 based on whether dataSource was deleted.
 */
deleteDataSource = async (req, res) => {
	try {
		const id = req.query.id;

		if (!id) {
			return res
				.status(400)
				.json({ errorMessage: "Please enter all required fields." });
		}

		console.log("deleting ds with id " + id);

		const ds = await DataSource.findOneAndDelete({ _id: id });

		if (!ds) {
			return res.status(404).json({ error: "no ds with this id" });
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
	createDataSource,
	updateDataSource,
	getDataSourceById,
	deleteDataSource,
};
