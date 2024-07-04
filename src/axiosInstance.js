import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://192.168.67.89:8000', // Your backend API base URL
  proxy: {
    host: '10.225.145.123', // Replace with your proxy address
    port: 8080,      // Replace with your proxy port
  },
});

export default axiosInstance;
