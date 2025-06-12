import { useState, type JSX } from "react";
import "@styles/pages/auth.css";
import Login from "@/features/auth/components/login";
import Register from "@/features/auth/components/register";

const Auth = (): JSX.Element => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode((prevMode) => !prevMode);
  };

  return (
    <div className="auth">
      {isLoginMode ? (
        <Login onSwitchMode={toggleMode} />
      ) : (
        <Register onSwitchMode={toggleMode} />
      )}
    </div>
  );
};

export default Auth;