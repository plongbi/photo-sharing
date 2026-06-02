import axios from "axios";

/**
 * fetchModelData - Thực hiện gọi API lấy dữ liệu mô hình từ Backend CodeSandbox
 * @param {string} url - Đường dẫn endpoint (Ví dụ: "/user/list")
 * @returns {Promise} - Trả về dữ liệu JSON từ server
 */
async function fetchModelData(url) {
  try {
    // Tự động nối domain CodeSandbox của bạn vào trước endpoint
    const response = await axios.get(`https://jsd7fz-8081.csb.app${url}`, {
      withCredentials: true, // Rất quan trọng: Giúp gửi Session Cookie đi kèm mọi request GET
    });
    return response.data;
  } catch (error) {
    console.error("Fetch model data failed:", error);
    throw error;
  }
}

export default fetchModelData;
