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
api.interceptors.request.use(
        (config) => {
                const token = localStorage.getItem("user");
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
                        localStorage.removeItem("user");
                        return Promise.reject({ ...apiResponse, unauthorized: true });
                }
                return Promise.reject(apiResponse);
        }
);

// sheet CRUD
export const sheetinfo = (sheetURL) =>
        api.get(`/sheetinfo/`, { params: { sheetURL: sheetURL } });

export const editSheet = (sheetURL, values, row) =>
        api.post(`/editSheet/`, {
                sheetURL: sheetURL,
                values: values,
                row: row,
        });

export const inGlobalDevList = () => api.get(`/inGlobalDevList/`);

const apis = {
	sheetinfo,
	inGlobalDevList,
	editSheet,
};

export default apis;
