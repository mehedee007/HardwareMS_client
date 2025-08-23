import axios from "axios";
import { envConfig } from "@/config/envConfig";
import { constents } from "@/constents";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: envConfig.baseURL(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 60000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(constents.AUTH_KEY) || Cookies.get(constents.AUTH_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);


export default axiosInstance;