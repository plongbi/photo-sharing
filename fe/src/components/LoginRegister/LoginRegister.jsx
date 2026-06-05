import "./styles.css";
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../lib/fetchModelData";

export default function LoginRegister({ setCurrentUser }) {
  const [login_name, setLoginName] = useState("");
  const [password, setPassword] = useState("");

  const [registerData, setRegisterData] = useState({
    login_name: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/admin/login`,
        {
          login_name,
          password,
        },
        {
          withCredentials: true,
        }
      );

      setCurrentUser(res.data);
      localStorage.setItem("currentUser", JSON.stringify(res.data));
    } catch (err) {
      alert(
        "Login failed: " + (err.response?.data?.message || "Unknown error")
      );
    }
  };

  const handleRegister = async () => {
    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/user`, registerData);

      alert("Register success");
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <h1 className="login-title">Photo Sharing App</h1>

        <div className="form-section">
          <h2>Login</h2>

          <div className="form-row">
            <input
              placeholder="Login name"
              value={login_name}
              onChange={(e) => setLoginName(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>Login</button>
          </div>
        </div>

        <div className="form-section">
          <h2>Register</h2>

          <div className="form-row">
            {Object.keys(registerData).map((key) => (
              <input
                key={key}
                type={key.includes("password") ? "password" : "text"}
                placeholder={key.replace("_", " ")}
                value={registerData[key]}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    [key]: e.target.value,
                  })
                }
              />
            ))}

            <button onClick={handleRegister}>Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}
