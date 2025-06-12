import { type JSX } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "@styles/layouts/Layout.css";
import { useAuth } from "@/contexts/AuthContext";

const MainLayout = (): JSX.Element => {
  const navigator = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigator("/authentication");
  };

  return (
    <div className="main-layout">
      <header>
        <nav>
          <div className="nav-logo">
            <button className="logo" onClick={() => navigator("/")}>
              <span>Learning Eng</span>
            </button>
          </div>
          <div className="nav-menus">
            <ul>
              <li>
                <button onClick={() => navigator("/")}>
                  Danh sách bài học
                </button>
              </li>
              <li>
                <button onClick={() => navigator("/my-progress")}>
                  Xem tiến độ
                </button>
              </li>
            </ul>
          </div>
          <div className="nav-actions">
            {user ? (
              <>
                <p>
                  Chào, <strong>{user.fullName}</strong>
                </p>
                <button onClick={handleLogout} className="logout-btn">
                  Đăng xuất
                </button>
              </>
            ) : (
              <button onClick={() => navigator("/authentication")}>
                Đăng nhập
              </button>
            )}
          </div>
        </nav>
      </header>
      <div className="container">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
