using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_2280600123.DTOs
{
    public class OtpVerificationDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string OtpCode { get; set; }
    }
}