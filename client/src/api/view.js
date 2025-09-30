/**
 *
 * Interacts with the data-based APIs in the backend.
 *
 */

import axios from 'axios';
axios.defaults.withCredentials = true;
const api = axios.create({
	baseURL: 'http://localhost:4000/view'
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

// View CRUD
export const createView = (view) => api.post('/createView/', view);

export const updateView = (view) => api.put('/updateView/', view);

export const getViewById = (id) => api.get('/getViewById/?id=' + id, { params: { id: id } });

export const deleteView = (id) => api.delete('/deleteView/', { params: { id: id } });

const apis = {
	createView,
	getViewById,
	updateView,
	deleteView
};

export default apis;
