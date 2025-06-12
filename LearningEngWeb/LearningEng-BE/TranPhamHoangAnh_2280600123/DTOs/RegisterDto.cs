using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_2280600123.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Họ tên không được để trống")]
        [StringLength(255)]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string Password { get; set; }
    }
}