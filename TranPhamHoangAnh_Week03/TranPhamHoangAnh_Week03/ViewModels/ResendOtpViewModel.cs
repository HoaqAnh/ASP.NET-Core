using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_Week03.ViewModels
{
    public class ResendOtpViewModel
    {
        [Required(ErrorMessage = "Vui lòng nhập địa chỉ email của bạn.")]
        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ.")]
        public string Email { get; set; }
    }
}