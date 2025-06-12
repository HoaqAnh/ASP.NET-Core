import { type JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "@components/layouts/main/MainLayout";
import AdminLayout from "@components/layouts/admin/AdminLayout";

// Auth & Public Pages
import Auth from "@pages/Auth";
import ConfirmEmailPage from "@/pages/ConfirmEmailPage";
import VerifyAdminOtpPage from "@/pages/VerifyAdminOtpPage";

// Student Pages
import LessonListPage from "@/pages/LessonListPage";
import LessonDetail from "@pages/LessonDetail";
import QuizTakingPage from "@pages/QuizTakingPage";
import QuizResultPage from "@pages/QuizResultPage";
import MyProgress from "@/pages/MyProgress";

// Admin Pages
import ManageLessons from "@pages/admin/ManageLessons";
import LessonDashboard from "@pages/admin/LessonDashboard";
import ManageUsers from "@/pages/admin/ManageUsers";
import ManageQuizzes from "@/pages/admin/ManageQuizzes";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

// Helpers
import ProtectedRoute from "@routers/ProtectedRoute";
import { useAuth } from "@contexts/AuthContext";

const AppRoutes = (): JSX.Element => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ============================================= */}
      {/* 1. CÁC ROUTE CÔNG KHAI & XÁC THỰC         */}
      {/* ============================================= */}
      <Route
        path="/authentication"
        element={
          user ? (
            <Navigate to={user.role === "Admin" ? "/admin" : "/"} replace />
          ) : (
            <Auth />
          )
        }
      />
      
      <Route path="/authentication/confirm-email" element={<ConfirmEmailPage />} />
      <Route path="/authentication/verify-admin-otp" element={<VerifyAdminOtpPage />} />


      {/* ============================================= */}
      {/* 2. CÁC ROUTE CỦA ADMIN (ĐƯỢC BẢO VỆ)     */}
      {/* ============================================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="Admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="analytics" replace />} /> 
        <Route path="lessons" element={<ManageLessons />} />
        <Route path="lessons/:lessonId" element={<LessonDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="quizzes" element={<ManageQuizzes />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>


      {/* ============================================= */}
      {/* 3. CÁC ROUTE CỦA STUDENT (ĐƯỢC BẢO VỆ)   */}
      {/* ============================================= */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="Student">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LessonListPage />} />
        <Route path="lessons/:lessonId" element={<LessonDetail />} />
        <Route path="quiz/:quizId" element={<QuizTakingPage />} />
        <Route path="quiz/result/:historyId" element={<QuizResultPage />} />
        <Route path="my-progress" element={<MyProgress />} />
      </Route>

      {/* Route bắt lỗi 404 cho các đường dẫn không tồn tại */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;