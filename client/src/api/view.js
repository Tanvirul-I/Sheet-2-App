/**
 *
 * Interacts with the data-based APIs in the backend.
 *
 */

import axios from "axios";
axios.defaults.withCredentials = true;
const api = axios.create({
	baseURL: "http://localhost:4000/view",
});
api.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error.response)
);

// View CRUD
export const createView = (view) => api.post("/createView/", view);

export const updateView = (view) => api.put("/updateView/", view);

export const getViewById = (id) =>
	api.get("/getViewById/?id=" + id, { params: { id: id } });

export const deleteView = (id) =>
	api.delete("/deleteView/", { params: { id: id } });

const apis = {
	createView,
	getViewById,
	updateView,
	deleteView,
};

export default apis;
