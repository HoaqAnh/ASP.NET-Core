using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace TranPhamHoangAnh_Week03.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string messageBody)
        {
            try
            {
                var smtpHost = _configuration["SmtpSettings:Host"];
                var smtpPort = int.Parse(_configuration["SmtpSettings:Port"]);
                var smtpUser = _configuration["SmtpSettings:User"];
                var smtpPass = _configuration["SmtpSettings:Pass"];
                var fromEmail = _configuration["SmtpSettings:FromEmail"];
                var fromName = _configuration["SmtpSettings:FromName"] ?? "Tranh Auh";

                if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass) || string.IsNullOrEmpty(fromEmail))
                {
                    _logger.LogError("SMTP settings are not configured properly in appsettings.json.");
                    return;
                }

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = subject,
                    Body = messageBody,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(toEmail);

                using (var smtpClient = new SmtpClient(smtpHost, smtpPort))
                {
                    smtpClient.Credentials = new NetworkCredential(smtpUser, smtpPass);
                    smtpClient.EnableSsl = true;

                    _logger.LogInformation($"Attempting to send email to {toEmail} with subject '{subject}' via {smtpHost}");
                    await smtpClient.SendMailAsync(mailMessage);
                    _logger.LogInformation($"Email sent successfully to {toEmail}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending email to {toEmail}: {ex.Message}");
            }
        }

        public async Task SendOtpEmailAsync(string toEmail, string otpCode, string userName)
        {
            var subject = "Xác thực địa chỉ Email của bạn - Tranh Auh";
            var messageBody = $@"
                <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <h2 style='color: #0056b3;'>Chào {userName},</h2>
                    <p>Cảm ơn bạn đã đăng ký tài khoản tại Tranh Auh.</p>
                    <p>Vui lòng sử dụng mã OTP dưới đây để xác thực địa chỉ email của bạn. Mã OTP này sẽ có hiệu lực trong <strong>10 phút</strong>.</p>
                    <p style='font-size: 24px; font-weight: bold; color: #d9534f; letter-spacing: 2px; margin: 20px 0; text-align: center;'>{otpCode}</p>
                    <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                    <p>Trân trọng,<br>Đội ngũ Tranh Auh</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'/>
                    <p style='font-size: 0.9em; color: #777;'>Đây là email tự động, vui lòng không trả lời.</p>
                </div>";
            await SendEmailAsync(toEmail, subject, messageBody);
        }
        public async Task SendPasswordResetLinkAsync(string toEmail, string resetLink, string userName)
        {
            var subject = "Yêu cầu đặt lại mật khẩu - Tranh Auh";
            var messageBody = $@"
                <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <h2 style='color: #0056b3;'>Chào {userName},</h2>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại Tranh Auh.</p>
                    <p>Vui lòng nhấp vào đường link dưới đây để đặt lại mật khẩu của bạn. Đường link này sẽ có hiệu lực trong <strong>30 phút</strong>.</p>
                    <p style='margin: 20px 0;'>
                        <a href='{resetLink}' style='background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;'>
                            Đặt Lại Mật Khẩu
                        </a>
                    </p>
                    <p>Nếu bạn không thể nhấp vào nút trên, vui lòng sao chép và dán URL sau vào trình duyệt của bạn:</p>
                    <p><a href='{resetLink}'>{resetLink}</a></p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    <p>Trân trọng,<br>Đội ngũ Tranh Auh</p>
                </div>";
            await SendEmailAsync(toEmail, subject, messageBody);
        }
    }
}