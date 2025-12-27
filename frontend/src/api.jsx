import axios from 'axios';

const isDev = window.location.hostname === 'localhost';
const baseURL = isDev ? "http://localhost:8000" : "https://not-dead-yet.fly.dev";

const api = axios.create({
    baseURL: baseURL
});

export default api;