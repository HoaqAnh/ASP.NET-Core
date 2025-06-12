namespace TranPhamHoangAnh_2280600123.DTOs
{
    public class StudentDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public bool IsEnabled { get; set; }
    }
}