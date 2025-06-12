using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_Week03.ViewModels
{
    public class VerifyEmailViewModel
    {
        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress]
        public string Email { get; set; }

        [Required(ErrorMessage = "Mã OTP không được để trống.")]
        [StringLength(10, ErrorMessage = "Mã OTP không hợp lệ.")]
        [Display(Name = "Mã OTP")]
        public string OtpCode { get; set; }
    }
}