import React, { useState, useEffect } from "react";
import { Typography, Button, Box } from "@material-ui/core";
import { useParams, Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Gọi API lấy thông tin chi tiết user
    fetchModel(`/user/${userId}`)
      .then((data) => {
        setUser(data);
      })
      .catch((err) => console.error("Lỗi khi lấy chi tiết user:", err));
  }, [userId]); // Chạy lại nếu userId trên URL thay đổi

  // Hiển thị chữ Loading trong lúc chờ API trả dữ liệu
  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {user.first_name} {user.last_name}
      </Typography>
      <Typography variant="body1">
        <strong>Location:</strong> {user.location}
      </Typography>
      <Typography variant="body1">
        <strong>Description:</strong> {user.description}
      </Typography>
      <Typography variant="body1">
        <strong>Occupation:</strong> {user.occupation}
      </Typography>

      <Box mt={3}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/photos/${user._id}`}
        >
          View Photos
        </Button>
      </Box>
    </Box>
  );
}

export default UserDetail;
