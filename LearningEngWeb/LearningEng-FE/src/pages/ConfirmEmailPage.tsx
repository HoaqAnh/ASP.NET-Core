import { useState, useEffect, type JSX } from "react";
import "@styles/pages/ConfirmEmailPage.css";

const ConfirmEmailPage = (): JSX.Element => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("user@example.com");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (otp === "123456") {
        setSuccess(
          "Xác thực thành công! Đang chuyển hướng đến trang đăng nhập..."
        );
        setTimeout(() => {
          console.log("Redirect to authentication page");
        }, 3000);
      } else {
        throw new Error("Mã OTP không hợp lệ");
      }
    } catch (err: any) {
      setError(err.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    console.log("Resend OTP");
  };

  return (
    <div className="confirm-email-container">
      {/* Background decorative elements */}
      <div className="background-decoration">
        <div className="decoration-circle decoration-circle-1"></div>
        <div className="decoration-circle decoration-circle-2"></div>
      </div>

      <div className="confirm-email-wrapper">
        {/* Main card */}
        <div className="confirm-email-card">
          {/* Header with icon */}
          <div className="header-section">
            <div className="icon-container">
              <svg
                className="shield-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="header-text">
              <h2 className="main-title">Xác nhận Email</h2>
              <p className="subtitle">Bảo mật tài khoản của bạn</p>
            </div>
          </div>

          {/* Email info */}
          <div className="email-info-card">
            <div className="email-info-content">
              <svg
                className="mail-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div className="email-text">
                <p className="email-label">Mã OTP đã được gửi đến:</p>
                <p className="email-address">{email}</p>
              </div>
            </div>
          </div>

          <p className="instruction-text">
            Vui lòng nhập mã 6 số để hoàn tất đăng ký tài khoản
          </p>

          {/* Form */}
          <div className="form-section">
            <div className="input-group">
              <label className="input-label">Nhập mã OTP</label>
              <div className="input-container">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  placeholder="123456"
                  className="otp-input"
                  required
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="message-container error-message">
                <svg
                  className="message-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="m12 17 .01 0" />
                </svg>
                <p className="message-text">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="message-container success-message">
                <svg
                  className="message-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
                <p className="message-text">{success}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || otp.length !== 6}
              className={`submit-button ${
                isLoading || otp.length !== 6 ? "disabled" : ""
              }`}
            >
              {isLoading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <span>Đang xác nhận...</span>
                </div>
              ) : (
                <div className="button-content">
                  <svg
                    className="button-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Xác nhận</span>
                </div>
              )}
            </button>
          </div>

          {/* Help text */}
          <div className="help-section">
            <p className="help-text">
              Không nhận được mã? Kiểm tra thư mục spam hoặc
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              className="resend-button"
            >
              Gửi lại mã OTP
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="footer-section">
          <p className="footer-text">
            Bằng việc xác nhận, bạn đồng ý với điều khoản sử dụng của chúng tôi
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
