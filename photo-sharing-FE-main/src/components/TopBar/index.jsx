import React from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
} from "@material-ui/core";

import { useLocation } from "react-router-dom";

import axios from "axios";

function TopBar({
  advancedFeatures,
  setAdvancedFeatures,
  currentUser,
  setCurrentUser,
}) {
  const location = useLocation();

  const path = location.pathname;

  let contextText = "Welcome to Photo App";

  /* =========================
     CONTEXT TEXT
  ========================= */

  if (path.startsWith("/users/")) {
    contextText = "User Detail";
  } else if (path.startsWith("/photos/")) {
    contextText = "User Photos";
  }

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8081/admin/logout",
        {},
        {
          withCredentials: true,
        }
      );

      setCurrentUser(null);
      localStorage.removeItem("currentUser");
    } catch (err) {
      alert("Logout failed");
    }
  };

  /* =========================
     UPLOAD PHOTO
  ========================= */

  const handleUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      const formData = new FormData();

      formData.append(
        "photo",
        e.target.files[0]
      );

      await axios.post(
        "http://localhost:8081/photos/new",
        formData,
        {
          withCredentials: true,
        }
      );

      alert("Upload success");

      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed: " + err.message);
    }
  };

  return (
    <AppBar
      position="static"
      className="topbar-appBar"
    >
      <Toolbar
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* LEFT */}

        <Typography variant="h6">
          Phạm Hải Long - B23DCVT258
        </Typography>

        {/* CENTER */}

        <FormControlLabel
          control={
            <Checkbox
              checked={advancedFeatures}
              onChange={(e) =>
                setAdvancedFeatures(
                  e.target.checked
                )
              }
              style={{ color: "white" }}
            />
          }
          label="Enable Advanced Features"
        />

        {/* RIGHT */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          {/* USER */}

          <Typography variant="h6">
            Hi {currentUser.first_name}
          </Typography>

          {/* CONTEXT */}

          <Typography variant="h6">
            {contextText}
          </Typography>


          {/* UPLOAD */}
          <input
            type="file"
            id="upload-photo-input"
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => document.getElementById('upload-photo-input').click()}
          >
            Add photo
          </Button>

          {/* LOGOUT */}

          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;