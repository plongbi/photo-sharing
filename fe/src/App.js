import "./App.css";
import React, { useState } from "react";
import { Grid, Paper } from "@material-ui/core";
import {BrowserRouter as Router,Route,Routes,Navigate} from "react-router-dom";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister/LoginRegister";

const App = () => {
  const [advancedFeatures, setAdvancedFeatures] =
    useState(false);

  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("currentUser")));

  /* =========================
     IF NOT LOGIN
  ========================= */

  if (!currentUser) {
    return (
      <Router>
        <LoginRegister
          setCurrentUser={setCurrentUser}
        />
      </Router>
    );
  }

  /* =========================
     MAIN APP
  ========================= */

  return (
    <Router>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar
              advancedFeatures={advancedFeatures}
              setAdvancedFeatures={
                setAdvancedFeatures
              }
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          </Grid>

          <div className="main-topbar-buffer" />

          {/* USER LIST */}

          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserList />
            </Paper>
          </Grid>

          {/* MAIN CONTENT */}

          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                {/* HOME */}

                <Route
                  path="/"
                  element={
                    <Navigate
                      to={`/users/${currentUser._id}`}
                      replace
                    />
                  }
                />

                {/* USER DETAIL */}

                <Route
                  path="/users/:userId"
                  element={<UserDetail />}
                />

                {/* USER PHOTOS */}

                <Route
                  path="/photos/:userId"
                  element={
                    <UserPhotos
                      advancedFeatures={
                        advancedFeatures
                      }
                    />
                  }
                />

                {/* DEEP LINK */}

                <Route
                  path="/photos/:userId/:photoId"
                  element={
                    <UserPhotos
                      advancedFeatures={
                        advancedFeatures
                      }
                    />
                  }
                />

                {/* FALLBACK */}

                <Route
                  path="*"
                  element={
                    <Navigate
                      to={`/users/${currentUser._id}`}
                    />
                  }
                />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Router>
  );
};

export default App;