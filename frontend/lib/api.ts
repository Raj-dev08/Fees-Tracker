import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use(async(config) => {
    const token = await localStorage.getItem("token");
    if(token)config.headers.Authorization = `Bearer ${token}`;
    return config;
})

export { api }