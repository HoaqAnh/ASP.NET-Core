using System.Threading.Tasks;

namespace TranPhamHoangAnh_Week03.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string message);
        Task SendOtpEmailAsync(string toEmail, string otpCode, string userName);
        Task SendPasswordResetLinkAsync(string toEmail, string resetLink, string userName);
    }
}