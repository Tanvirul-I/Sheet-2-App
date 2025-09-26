/**
 *
 * Interacts with the data-based APIs in the backend.
 *
 */

import axios from "axios";
axios.defaults.withCredentials = true;
const api = axios.create({
	baseURL: "http://localhost:4000/app",
});
api.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error.response)
);

// App CRUD
export const createApp = (app) => api.post("/createApp/", app);

export const getApps = (user) =>
	api.get("/getApps/", { params: { user: user } });

export const updateApp = (app) => api.put("/updateApp/", app);

export const getAppById = (id) =>
	api.get("/getAppById/", { params: { id: id } });

export const deleteApp = (id) =>
	api.delete("/deleteApp/", { params: { id: id } });

export const updateRoles = (app) => api.put("/updateRoles/", app);

const apis = {
	createApp,
	getApps,
	updateApp,
	getAppById,
	deleteApp,
	updateRoles,
};

export default apis;
