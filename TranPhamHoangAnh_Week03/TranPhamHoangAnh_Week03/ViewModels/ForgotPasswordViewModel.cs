using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_Week03.ViewModels
{
    public class ForgotPasswordViewModel
    {
        [Required(ErrorMessage = "Vui lòng nhập địa chỉ email của bạn.")]
        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ.")]
        [Display(Name = "Địa chỉ Email")]
        public string Email { get; set; }
    }
}