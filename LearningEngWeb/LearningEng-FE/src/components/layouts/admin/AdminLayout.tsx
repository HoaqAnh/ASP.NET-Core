import { type JSX } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "@styles/layouts/Layout.css";
import { useAuth } from "@/contexts/AuthContext";

const AdminLayout = (): JSX.Element => {
  const navigator = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigator("/authentication");
  };

  return (
    <div className="admin-layout">
      <header>
        <nav>
          <div className="nav-logo">
            <button className="logo" onClick={() => navigator("/admin")}>
              <span>Learning Eng Admin</span>
            </button>
          </div>
          <div className="nav-menus">
            <ul>
              <li>
                <button onClick={() => navigator("/admin/lessons")}>
                  Quản lý bài học
                </button>
              </li>
              <li>
                <button onClick={() => navigator("/admin/quizzes")}>
                  Quản lý Quiz
                </button>
              </li>
              <li>
                <button onClick={() => navigator("/admin/users")}>
                  Quản lý người dùng
                </button>
              </li>
              <li>
                <button onClick={() => navigator("/admin/analytics")}>
                  Thống kê
                </button>
              </li>
            </ul>
          </div>
          <div className="nav-actions">
            {user ? (
              <>
                <p>
                  Admin: <strong>{user.fullName}</strong>
                </p>
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-color)",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    color: "var(--foreground)",
                    fontSize: "0.875rem",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary-color)";
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 67, 67, 0.1)";
                    e.currentTarget.style.color = "#ef4444";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--foreground)";
                  }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <p>Admin User</p>
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

export default AdminLayout;
