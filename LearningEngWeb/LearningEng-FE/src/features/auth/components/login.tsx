import React, { useState, type JSX } from "react";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onSwitchMode: () => void;
}

const Login = ({ onSwitchMode }: LoginProps): JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await login({ email, password });
      if (response.otpRequired) {
        navigate("/authentication/verify-admin-otp", {
          state: { email: response.email },
        });
      } else if (response.token) {
        alert("Đăng nhập thành công!");
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra.");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <p className="heading">Đăng nhập</p>
      <input
        placeholder="EMAIL"
        id="email"
        className="input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        placeholder="PASSWORD"
        id="password"
        className="input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <a>Quên mật khẩu?</a>
      <button className="btn" type="submit" disabled={isLoading}>
        {isLoading ? "Đang xử lý..." : "Đăng nhập"}
      </button>
      <div className="text-inside">
        <p>Không có tài khoản?</p>
        <a type="button" id="link" onClick={onSwitchMode}>
          Đăng ký ngay
        </a>
      </div>
    </form>
  );
};

export default Login;
