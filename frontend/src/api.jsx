import axios from 'axios';

const api = axios.create({
    baseURL: "https://not-dead-yet.fly.dev//"
});

export default api;