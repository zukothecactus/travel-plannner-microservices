import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8584/api', // Adjust the base URL as needed
})

//potreban nam je presretac koji ce da doda token u header svakog zahteva
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;