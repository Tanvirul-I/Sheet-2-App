/**
 *
 * Interacts with the data-based APIs in the backend.
 *
 */

import axios from 'axios';
axios.defaults.withCredentials = true;
const api = axios.create({
	baseURL: 'http://localhost:4000/app'
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

// App CRUD
export const createApp = (app) => api.post('/createApp/', app);

export const getApps = () => api.get('/getApps/');

export const updateApp = (app) => api.put('/updateApp/', app);

export const getAppById = (id) => api.get('/getAppById/', { params: { id: id } });

export const deleteApp = (id) => api.delete('/deleteApp/', { params: { id: id } });

export const updateRoles = (app) => api.put('/updateRoles/', app);

const apis = {
	createApp,
	getApps,
	updateApp,
	getAppById,
	deleteApp,
	updateRoles
};

export default apis;
