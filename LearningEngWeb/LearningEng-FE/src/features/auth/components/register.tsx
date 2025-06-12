import React, { useState, type JSX } from "react";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface RegisterProps {
  onSwitchMode: () => void;
}

const Register = ({ onSwitchMode }: RegisterProps): JSX.Element => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      await register({ fullName, email, password });
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      onSwitchMode();
      navigate('/authentication/confirm-email', { state: { email: email } });
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại."
      );
    }
    
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <p className="heading">Đăng ký</p>
      <input
        placeholder="FULL NAME"
        id="fullName"
        className="input"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
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
      <button className="btn" type="submit" disabled={isLoading}>
        {isLoading ? "Đang xử lý..." : "Đăng ký"}
      </button>
      <div className="text-inside">
        <p>Đã có tài khoản?</p>
        <a type="button" id="link" onClick={onSwitchMode}>
          Đăng nhập
        </a>
      </div>
    </form>
  );
};

export default Register;
