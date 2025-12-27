import axios from 'axios';

const isDev = window.location.hostname === 'localhost';
const baseURL = isDev ? "http://localhost:8000" : process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: baseURL
});

export default api;