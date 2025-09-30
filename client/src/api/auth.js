/**
 *
 * Uses axios to send requests to the backend auth APIs.
 *
 */

import axios from 'axios';
axios.defaults.withCredentials = true;
const api = axios.create({
	baseURL: 'http://localhost:4000/auth'
});
api.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error.response)
);

// Login takes the Google Code and passes it to the server
export const loginUser = (googleCred) => api.get(`/login/`, { params: { code: googleCred } });
// Takes the current user and logs them out
export const logoutUser = (token) => api.get(`/logout/`, { params: { token: token } });
// Takes the JWT token and returns the given user's information
export const getUserInfo = (token) => api.get(`/user/`, { params: { token: token } });

const apis = {
	loginUser,
	logoutUser,
	getUserInfo
};

export default apis;
