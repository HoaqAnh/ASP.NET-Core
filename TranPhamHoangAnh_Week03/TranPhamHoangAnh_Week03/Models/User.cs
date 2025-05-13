using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TranPhamHoangAnh_Week03.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string Role { get; set; } = "User";

        public User(string name, string email, string password, string? address, string? phoneNumber, string role = "User")
        {
            Name = name;
            Email = email;
            Password = password;
            Address = address;
            PhoneNumber = phoneNumber;
            Role = role;
        }
    }
}
