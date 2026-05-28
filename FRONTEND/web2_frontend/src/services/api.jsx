import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8584/api', // Adjust the base URL as needed
})

export default api;