/**
 *
 * Interacts with the data-based APIs in the backend.
 *
 */

import axios from 'axios';
axios.defaults.withCredentials = true;
const api = axios.create({
	baseURL: 'http://localhost:4000/data'
});
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('user');
		if (token) {
			config.headers = config.headers || {};
			config.headers.Authorization = `Bearer ${token}`;
		} else if (config.headers?.Authorization) {
			delete config.headers.Authorization;
		}
		return config;
	},
	(error) => Promise.reject(error)
);
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const apiResponse = error?.response || error;
		if (apiResponse?.status === 401) {
			localStorage.removeItem('user');
			return Promise.reject({ ...apiResponse, unauthorized: true });
		}
		return Promise.reject(apiResponse);
	}
);

// DataSource CRUD
export const createDataSource = (ds) => api.post('/createDataSource/', ds);

export const updateDataSource = (ds) => api.put('/updateDataSource/', ds);

export const getDataSourceById = (id) =>
	api.get('/getDataSourceById/', {
		params: { id: id }
	});

export const deleteDataSource = (id) => api.delete('/deleteDataSource/', { params: { id: id } });

const apis = {
	createDataSource,
	getDataSourceById,
	updateDataSource,
	deleteDataSource
};

export default apis;
