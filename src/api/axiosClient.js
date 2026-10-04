import axios from 'axios';
const axiosClient = axios.create({
  baseURL: "http://localhost:5002/api", // Thay đổi URL cơ sở của API nếu cần
  //  https://aplushn-api.onrender.com/api
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => response.data, 
  (error) => Promise.reject(error)
);

export default axiosClient;