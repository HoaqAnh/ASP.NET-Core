using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_2280600123.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress]
        public string Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string Password { get; set; }
    }
}