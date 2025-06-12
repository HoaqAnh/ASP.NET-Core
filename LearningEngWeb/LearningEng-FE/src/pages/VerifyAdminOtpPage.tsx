import { useState, useEffect, type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyAdminOtp } from '@features/auth/services/authService';
import { useAuth } from '@/contexts/AuthContext';

const VerifyAdminOtpPage = (): JSX.Element => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { completeAdminLogin } = useAuth();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/authentication');
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const authResponse = await verifyAdminOtp({ email, otpCode: otp });
      completeAdminLogin(authResponse);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Xác thực đăng nhập Admin</h2>
      <p>Mã OTP đã được gửi đến email: <strong>{email}</strong></p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mã OTP:</label>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
        </div>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang xác thực...' : 'Xác thực'}
        </button>
      </form>
    </div>
  );
};

export default VerifyAdminOtpPage;