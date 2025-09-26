/**
 *
 * Interacts with the data-based APIs in the backend.
 *
 */

import axios from "axios";
axios.defaults.withCredentials = true;
const api = axios.create({
	baseURL: "http://localhost:4000/sheets",
});
api.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error.response)
);

// sheet CRUD
export const sheetinfo = (user, sheetURL) =>
	api.get(`/sheetinfo/`, { params: { user: user, sheetURL: sheetURL } });

export const editSheet = (user, sheetURL, values, row) =>
	api.post(`/editSheet/`, {
		user: user,
		sheetURL: sheetURL,
		values: values,
		row: row,
	});

export const inGlobalDevList = (user) =>
	api.get(`/inGlobalDevList/`, { params: { user: user } });

const apis = {
	sheetinfo,
	inGlobalDevList,
	editSheet,
};

export default apis;
