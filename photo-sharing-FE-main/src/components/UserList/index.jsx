import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
} from "@material-ui/core";
import { Link } from "react-router-dom";
// Import hàm fetchModel bạn vừa tạo
import fetchModel from "../../lib/fetchModelData";

function UserList() {
  // Tạo state để lưu danh sách người dùng
  const [users, setUsers] = useState([]);

  // Dùng useEffect để gọi API ngay khi component được render
  useEffect(() => {
    fetchModel("/user/list")
      .then((data) => {
        setUsers(data); // Lưu dữ liệu từ backend vào state
      })
      .catch((err) => console.error("Lỗi khi lấy danh sách user:", err));
  }, []); // Mảng rỗng [] nghĩa là chỉ gọi 1 lần khi load trang

  return (
    <div>
      <Typography variant="h6">User List</Typography>
      <List component="nav">
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <ListItem button component={Link} to={`/users/${user._id}`}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
