/**
 *
 * Interacts with the data-based APIs in the backend.
 *
 */

import axios from "axios";
axios.defaults.withCredentials = true;
const api = axios.create({
	baseURL: "http://localhost:4000/data",
});
api.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error.response)
);

// DataSource CRUD
export const createDataSource = (ds) => api.post("/createDataSource/", ds);

export const updateDataSource = (ds) => api.put("/updateDataSource/", ds);

export const getDataSourceById = (token, id) =>
	api.get("/getDataSourceById/", {
		params: { id: id, token: token },
	});

export const deleteDataSource = (id) =>
	api.delete("/deleteDataSource/", { params: { id: id } });

const apis = {
	createDataSource,
	getDataSourceById,
	updateDataSource,
	deleteDataSource,
};

export default apis;
