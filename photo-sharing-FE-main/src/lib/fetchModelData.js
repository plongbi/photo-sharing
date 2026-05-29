import axios from "axios";

/**
 * Hàm gọi API thực tế từ backend server sử dụng Axios
 */
function fetchModel(url) {
  return axios
    .get(`http://localhost:8081${url}`, {
      withCredentials: true,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("fetchModel error for URL " + url, error);
      throw error;
    });
}

export default fetchModel;
