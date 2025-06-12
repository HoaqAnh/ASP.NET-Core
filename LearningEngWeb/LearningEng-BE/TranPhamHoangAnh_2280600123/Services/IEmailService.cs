namespace TranPhamHoangAnh_2280600123.Services
{
    /// <summary>
    /// Định nghĩa hợp đồng cho một dịch vụ gửi email.
    /// Bất kỳ class nào triển khai interface này đều phải cung cấp một phương thức SendEmailAsync.
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Gửi email một cách bất đồng bộ.
        /// </summary>
        /// <param name="toEmail">Địa chỉ email của người nhận.</param>
        /// <param name="subject">Chủ đề của email.</param>
        /// <param name="message">Nội dung của email (có thể là HTML).</param>
        /// <returns>Một Task đại diện cho hoạt động gửi email.</returns>
        Task SendEmailAsync(string toEmail, string subject, string message);
    }
}